document.getElementById('openfile-check').addEventListener('click', function() {
    document.getElementById('fileInput-check').click();
});

document.getElementById('openfile2-check').addEventListener('click', function() {
    document.getElementById('fileInput-check').click();
});

document.getElementById('fileInput-check').addEventListener('change', async function() {
    document.getElementById('openfile-check').style.display = 'none';
    document.getElementById('openfile2-check').style.display = 'block';
    document.getElementById('download-pdf').style.display = 'block';
    document.getElementById('print-pdf').style.display = 'block';

    const files = this.files;
    const classGroups = {};

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

    // Group images by class
    for (const { result, type, name } of imageInfos) {
        const classMatch = name.match(/(\d+)班/);
        if (classMatch) {
            const className = parseInt(classMatch[1]) + '班';
            if (!classGroups[className]) {
                classGroups[className] = [];
            }
            classGroups[className].push({ result, type, name });
        }
    }

    // Sort classGroups by class name
    const sortedClasses = Object.keys(classGroups).sort((a, b) => {
        const aNum = parseInt(a);
        const bNum = parseInt(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum;
        } else if (!isNaN(aNum)) {
            return -1;
        } else if (!isNaN(bNum)) {
            return 1;
        } else {
            return 0; // 對於非數字班級，不改變順序
        }
    });

    const pagesContainer = document.getElementById('pages');
    pagesContainer.innerHTML = '';

    // Create pages and add images to them
    sortedClasses.forEach(className => {
        const classImages = classGroups[className];
        const imagesPerPage = 12; // 減少一行，顯示12張圖片（3行4列）

        for (let i = 0; i < classImages.length; i += imagesPerPage) { // Process 12 images per page
            const page = document.createElement('div');
            page.className = 'page';

            // Add the confirmation text at the beginning of each class
            if (i === 0) {
                const confirmationDiv = document.createElement('div');
                confirmationDiv.className = 'confirmation-text';
                confirmationDiv.innerHTML = `證件照之個人資料確認單 - ${className}`;
                page.appendChild(confirmationDiv);
            }

            const imageContainer = document.createElement('div');
            imageContainer.className = 'image-container';
            for (let j = 0; j < imagesPerPage && i + j < classImages.length; j++) {
                const { result, name } = classImages[i + j];

                // 隱藏身分證號碼部分
                let displayName = name.replace(/[A-Z]\d{9}/, ''); // 去掉一位英文+九位數字的部分
                displayName = displayName.trim(); // 去掉可能的前後空白

                const wrapper = document.createElement('div');
                wrapper.className = 'image-wrapper';
                const img = document.createElement('img');
                img.src = result;
                const filename = document.createElement('div');
                filename.className = 'filename';
                filename.textContent = displayName.substring(0, displayName.lastIndexOf('.'));
                wrapper.appendChild(img);
                wrapper.appendChild(filename);
                imageContainer.appendChild(wrapper);
            }
            page.appendChild(imageContainer);

            // Add the signature text at the end of each class
            if (i + imagesPerPage >= classImages.length) {
                const signatureDiv = document.createElement('div');
                signatureDiv.className = 'signature-text';
                signatureDiv.innerHTML = `確認照片與個人資料相符後在此處簽名________________`;
                page.appendChild(signatureDiv);
            }

            pagesContainer.appendChild(page);
        }
    });
});

document.getElementById('download-pdf').addEventListener('click', function() {
    generatePDF(false);
});
document.getElementById('print-pdf').addEventListener('click', function() {
    generatePDF(true);
});

function generatePDF(isPrint) {
    const element = document.getElementById('pages');
    const opt = {
        margin: [0, 0, 0, 0],
        filename: 'class_images.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).toPdf().get('pdf').then(function (pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            pdf.setPage(i);
            pdf.setFontSize(10);
            pdf.text(String(i) + '/' + String(totalPages), pdf.internal.pageSize.getWidth() - 20, pdf.internal.pageSize.getHeight() - 10);
        }
        if (isPrint) {
            pdf.autoPrint();
            window.open(pdf.output('bloburl'), '_blank');
        } else {
            pdf.save();
        }
    });
}
