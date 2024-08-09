document.getElementById('openfile-rename').addEventListener('click', function() {
    document.getElementById('fileInput-rename').click();
});

document.getElementById('openfile2-rename').addEventListener('click', function() {
    document.getElementById('fileInput-rename').click();
});

document.getElementById('fileInput-rename').addEventListener('change', function() {
    document.getElementById('openfile-rename').style.display = 'none';
    document.getElementById('openfile2-rename').style.display = 'block';
    document.getElementById('download-all').style.display = 'block'; // 顯示下載按鈕

    const files = this.files;
    const renamedFiles = [];

    // 修改的正則表達式：匹配任意部分中的一個字母加9位數字
    const renamePattern = /[a-zA-Z]\d{9}/;

    for (const file of files) {
        let newName = file.name.match(renamePattern);

        if (newName) {
            newName = newName[0] + file.name.substring(file.name.lastIndexOf('.')); // 保留副檔名
        } else {
            newName = file.name; // 如果不符合規則，保留原檔名
        }

        renamedFiles.push(new File([file], newName, { type: file.type }));
    }

    // 顯示重新命名後的檔名在頁面上
    const overviewDiv = document.querySelector('.overview');
    overviewDiv.innerHTML = ''; // 清空之前的內容

    renamedFiles.forEach(file => {
        const div = document.createElement('div');
        div.textContent = file.name;
        overviewDiv.appendChild(div);
    });

    // 綁定下載按鈕事件
    document.getElementById('download-all').addEventListener('click', function() {
        const zip = new JSZip();

        renamedFiles.forEach(file => {
            zip.file(file.name, file); // 添加文件到 ZIP
        });

        // 生成 ZIP 並觸發下載
        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = 'renamed_files.zip';
                a.click();
            });
    });
});