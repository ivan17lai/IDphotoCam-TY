let renamedFiles = [];  // 全局變數

document.getElementById('openfile-rename').addEventListener('click', function() {
    document.getElementById('fileInput-rename').click();
});

document.getElementById('openfile2-rename').addEventListener('click', function() {
    document.getElementById('fileInput-rename').click();
});

document.getElementById('delete').addEventListener('click', function() {
    // 恢復預設顯示狀態
    document.getElementById('openfile-rename').style.display = 'block';
    document.getElementById('openfile2-rename').style.display = 'none';
    document.getElementById('download-all').style.display = 'none'; 
    document.getElementById('delete').style.display = 'none';
    
    // 清空文件選擇器
    document.getElementById('fileInput-rename').value = '';
    
    // 清除已重命名的文件列表
    renamedFiles = [];
    
    // 清空預覽區
    document.querySelector('.overview').innerHTML = '';
});

document.getElementById('fileInput-rename').addEventListener('change', function() {
    // 切換按鈕顯示狀態
    document.getElementById('openfile-rename').style.display = 'none';
    document.getElementById('openfile2-rename').style.display = 'block';
    document.getElementById('download-all').style.display = 'block'; 
    document.getElementById('delete').style.display = 'block';

    // 獲取選擇的文件
    const files = this.files;
    
    // 清空之前的重命名文件
    renamedFiles = [];

    const renamePattern = /[a-zA-Z]\d{9}/;

    // 重新命名文件
    for (const file of files) {
        let newName = file.name.match(renamePattern);

        if (newName) {
            newName = newName[0] + file.name.substring(file.name.lastIndexOf('.')); // 保留副檔名
        } else {
            newName = file.name; 
        }

        renamedFiles.push(new File([file], newName, { type: file.type }));
    }

    // 更新預覽區
    const overviewDiv = document.querySelector('.overview');
    overviewDiv.innerHTML = ''; 

    renamedFiles.forEach(file => {
        const div = document.createElement('div');
        div.textContent = file.name;
        overviewDiv.appendChild(div);
    });

    document.getElementById('download-all').addEventListener('click', function() {
        const zip = new JSZip();

        renamedFiles.forEach(file => {
            zip.file(file.name, file); 
        });

        zip.generateAsync({ type: "blob" })
            .then(function(content) {
                const a = document.createElement('a');
                a.href = URL.createObjectURL(content);
                a.download = '重設檔案名稱後的所有照片.zip';
                a.click();
            });
    });
});
