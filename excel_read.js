var json;
var Json;
var nowID = '';


  document.getElementById('openfile').addEventListener('click', function() {
    document.getElementById('fileInput').click();
  });

  document.getElementById('openfile2').addEventListener('click', function() {
    document.getElementById('fileInput').click();
  });

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

      // 添加按鈕點擊事件
      button.addEventListener('click', function() {
        showClassStudents(code,button);
      });

      buttonContainer.appendChild(button);
    });
  }

  function showClassStudents(classCode,button) {

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

    studentList.forEach(function(student) {
      var button = document.createElement('button');
      button.innerHTML = `${student['學號']}-${student['學生姓名']}`;
      button.className = 'button-student';
      button.id = student['證照號碼'];
      button.addEventListener('click', function() {
        showStudent(button,student);
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
      for (let j = 0; j < enname.length; j++) {
        if (checkedIds[i] === enname[j]) {
          now_filename += Json[chchange[j]] + addch[j] + '-';
        }
      }
    }
    now_filename = now_filename.slice(0, -1);

    if (document.getElementById('student-information').innerHTML != '尚未選擇學生') {
      document.getElementById('student-information').innerHTML = now_filename;
    }
  }