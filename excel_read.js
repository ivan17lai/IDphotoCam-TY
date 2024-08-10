var json;
var Json;

var saved = true; // 預設未保存

var nowID = '';


// Helper function to set a cookie
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Helper function to get a cookie
function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}



// 綁定開啟文件按鈕事件
document.getElementById('openfile').addEventListener('click', function() {
  document.getElementById('fileInput').click();
});

document.getElementById('openfile2').addEventListener('click', function() {
  document.getElementById('fileInput').click();
});

// 綁定文件輸入變更事件
document.getElementById('fileInput').addEventListener('change', function(event) {
  var file = event.target.files[0];
  var reader = new FileReader();

  const openfile = document.getElementById('openfile');
  const openfile_small = document.getElementById('openfile2');

  reader.onload = function(e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, {type: 'array'});
    var sheetName = workbook.SheetNames[0];
    var worksheet = workbook.Sheets[sheetName];
    json = XLSX.utils.sheet_to_json(worksheet);

    // 提取班級代號
    var classCodes = [...new Set(json.map(item => item['班級']))];

    // 生成按鈕
    generateButtons(classCodes);

    openfile.style.display = 'none';
    openfile_small.style.display = 'block';
  };

  reader.readAsArrayBuffer(file);
});

function generateButtons(classCodes) {
  var buttonContainer = document.getElementById('classbuttom-Bar');
  buttonContainer.innerHTML = ''; // 清空容器
  
  classCodes.forEach(function(code) {
    var button = document.createElement('button');
    button.innerHTML = '班級 ' + code;
    button.className = 'button-class';

    // 添加按鈕點擊事件，先檢查是否保存
    button.addEventListener('click', function() {
      if (!saved) {
        if (!confirm("這個學生的照片尚未儲存，確定要切換到下一個學生嗎？")) {
          return; // 如果用戶取消，不執行操作
        }
      }
      showClassStudents(code, button);
    });

    buttonContainer.appendChild(button);
  });
}

function showClassStudents(classCode, button) {
  var studentButtons = document.getElementsByClassName('button-class');
  for (var i = 0; i < studentButtons.length; i++) {
      studentButtons[i].style.backgroundColor = '#FAFAFA';
  }

  var color = window.getComputedStyle(document.getElementById('openfile')).backgroundColor;
  button.style.backgroundColor = color;

  var studentList = json.filter(item => item['班級'] === classCode);

  // 清空並顯示學生列表
  var studentContainer = document.getElementById('student-Bar');
  studentContainer.innerHTML = '';

  console.log("Current cookies:", document.cookie);
  console.log("----------------------------------");


  studentList.forEach(function(student) {
      var button = document.createElement('button');
      var studentName = `${student['座號']}-${student['學生姓名']}`;
      
      // 檢查是否已保存到 cookies
      if (getCookie(student['證照號碼'])) {
          studentName += " (已拍攝)";
      }

      button.innerHTML = studentName;
      button.className = 'button-student';
      button.id = student['證照號碼'];
      
      // 添加按鈕點擊事件，先檢查是否保存
      button.addEventListener('click', function() {
          if (!saved) {
              if (!confirm("您有尚未儲存的更改，確定要不儲存退出嗎？")) {
                  return; // 如果用戶取消，不執行操作
              }
          }
          showStudent(button, student);
      });

      studentContainer.appendChild(button);
  });
}


function showStudent(button, student) {
  var color = window.getComputedStyle(document.getElementById('openfile')).backgroundColor;
  var studentButtons = document.getElementsByClassName('button-student');
  for (var i = 0; i < studentButtons.length; i++) {
    studentButtons[i].style.backgroundColor = '#FAFAFA';
  }
  
  button.style.backgroundColor = color;
  Json = student;
  
  updateFilename();
  nowID = student['證照號碼'];
  saved = false; // 切換學生後需要重新保存
  reShot();
}

function updateFilename() {
  const checkboxes = document.querySelectorAll('fieldset input[type="checkbox"]');

  const checkedIds = Array.from(checkboxes) // Convert NodeList to Array to use filter and map
    .filter(checkbox => checkbox.checked) // Keep only checked checkboxes
    .map(checkbox => checkbox.id); // Extract the id of each checked checkbox

  console.log('Checked checkboxes:', checkedIds);

  const chchange = ['班級', '學號', '座號', '學生姓名', '證照號碼'];
  const enname = ['class', 'sid', 'sitnu', 'name', 'id'];
  const addch = ['班', '', '號', '', ''];

  let now_filename = '';

  for (let i = 0; i < checkedIds.length; i++) {
    for (let j = 0; j < enname.length-1; j++) {
      if (checkedIds[i] === enname[j]) {
        now_filename += Json[chchange[j]] + addch[j] + '--';
      }
    }
  }
  now_filename = now_filename.slice(0, -2);

  if (document.getElementById('student-information').innerHTML != '尚未選擇學生') {
    document.getElementById('student-information').innerHTML = now_filename;
  }
}
