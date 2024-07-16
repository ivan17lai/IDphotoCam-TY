document.getElementById('openfile-check').addEventListener('click', function() {
    document.getElementById('fileInput-check').click();
});

document.getElementById('openfile2-check').addEventListener('click', function() {
    document.getElementById('fileInput-check').click();
});

document.getElementById('fileInput-check').addEventListener('change', async function() {
    document.getElementById('openfile-check').style.display = 'none';
    document.getElementById('openfile2-check').style.display = 'block';

    const files = this.files;
    const pdfDoc = await PDFLib.PDFDocument.create();
    const pageWidth = PDFLib.PageSizes.A4[0];
    const pageHeight = PDFLib.PageSizes.A4[1];
    const imageWidth = pageWidth / 4 - 10; // Add margin
    const imageHeight = pageHeight / 5 - 10; // Add margin

    // Read all files as data URLs
    const fileReaders = [];
    for (const file of files) {
        const reader = new FileReader();
        const promise = new Promise((resolve) => {
            reader.onload = () => resolve({ result: reader.result, type: file.type, name: file.name });
        });
        reader.readAsDataURL(file);
        fileReaders.push(promise);
    }

    // Wait for all file readers to complete
    const imageInfos = await Promise.all(fileReaders);

    // Create a canvas to draw text
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const scaleFactor = 2; // Increase for higher resolution text
    canvas.width = imageWidth * scaleFactor;
    canvas.height = 40 * scaleFactor; // Adjust height as needed

    // Embed images and add them to PDF
    for (let i = 0; i < imageInfos.length; i += 16) { // Process 16 images per page
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        for (let j = 0; j < 16 && i + j < imageInfos.length; j++) {
            const { result, type, name } = imageInfos[i + j];
            const img = new Image();
            img.src = result;
            await new Promise((resolve) => img.onload = resolve);
            const imageBytes = await fetch(result).then(res => res.arrayBuffer());
            let embeddedImage;
            if (type === 'image/png') {
                embeddedImage = await pdfDoc.embedPng(imageBytes);
            } else if (type === 'image/jpeg') {
                embeddedImage = await pdfDoc.embedJpg(imageBytes);
            } else {
                continue; // Skip unsupported image types
            }
            const x = (j % 4) * (imageWidth + 10); // Add margin
            const y = pageHeight - Math.floor(j / 4 + 1) * (imageHeight + 40); // Add margin and space for text
            page.drawImage(embeddedImage, {
                x: x,
                y: y,
                width: imageWidth,
                height: imageHeight,
            });

            // Draw the filename onto the canvas
            const filename = name.substring(0, name.lastIndexOf('.'));
            const segments = filename.split('-');
            let lines = [];
            let currentLine = '';

            // Add the segments to lines
            for (let k = 0; k < segments.length; k++) {
                if (k > 0) {
                    currentLine += '-';
                }
                currentLine += segments[k];
                if (k >= 2) {
                    lines.push(currentLine);
                    currentLine = '';
                }
            }
            if (currentLine) {
                lines.push(currentLine);
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.font = `${12 * scaleFactor}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Draw the wrapped text
            lines.forEach((line, index) => {
                ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index - lines.length / 2 + 0.5) * 20);
            });

            // Convert the canvas to a data URL
            const textDataUrl = canvas.toDataURL('image/png');
            const textImageBytes = await fetch(textDataUrl).then(res => res.arrayBuffer());
            const textEmbeddedImage = await pdfDoc.embedPng(textImageBytes);

            // Add the text image below the original image
            page.drawImage(textEmbeddedImage, {
                x: x,
                y: y - 30, // Position text image below the original image
                width: imageWidth,
                height: 30, // Adjust height as needed
            });
        }
    }

    // Generate PDF and trigger download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'images.pdf';
    link.click();
});
