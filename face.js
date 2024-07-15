const video1 = document.getElementsByClassName('input_video1')[0];
const out1 = document.getElementsByClassName('output1')[0];
const canvasCtx1 = out1.getContext('2d');
const captureBtn = document.getElementById('captureBtn');
const capturedImageContainer = document.getElementById('capturedImageContainer');
const shoted = document.getElementById('shoted');

var now_filename = 'photo';

const shoted_bar = document.getElementsByClassName('shoted-bar');
const shot_bar = document.getElementsByClassName('shot-bar');

let boxCoordinates = null;

// const spinner = document.querySelector('.loading');
// spinner.ontransitionend = () => {
//   spinner.style.display = 'none';
// };

function onResultsFace(results) {
  document.body.classList.add('loaded');
  canvasCtx1.save();
  canvasCtx1.clearRect(0, 0, out1.width, out1.height);
  canvasCtx1.drawImage(results.image, 0, 0, out1.width, out1.height);
  if (results.detections.length > 0) {
    // drawRectangle(
    //     canvasCtx1, results.detections[0].boundingBox,
    //     {color: 'blue', lineWidth: 4, fillColor: '#00000000'});
    // drawLandmarks(canvasCtx1, results.detections[0].landmarks, {
    //   color: 'red',
    //   radius: 5,
    // });

    const displayBroad = document.getElementsByClassName('display_xy')[0];
    const leftEdge = results.detections[0].landmarks[4];  // 左臉邊緣
    const rightEdge = results.detections[0].landmarks[5]; // 右臉邊緣

    // 將歸一化座標轉換為畫布像素座標
    const leftEdgeX = leftEdge.x * out1.width;
    const leftEdgeY = leftEdge.y * out1.height;
    const rightEdgeX = rightEdge.x * out1.width;
    const rightEdgeY = rightEdge.y * out1.height;

    // 顯示臉部邊緣位置到 displayBroad 元素
    // displayBroad.innerHTML = `Left Edge: x=${leftEdgeX.toFixed(2)}, y=${leftEdgeY.toFixed(2)}<br>Right Edge: x=${rightEdgeX.toFixed(2)}, y=${rightEdgeY.toFixed(2)}`;

    // 計算臉部中心點
    const centerX = (leftEdgeX + rightEdgeX) / 2;
    const centerY = (leftEdgeY + rightEdgeY) / 2;

    // 計算臉部寬度作為矩形框的寬度
    const faceWidth = Math.sqrt(Math.pow(rightEdgeX - leftEdgeX, 2) + Math.pow(rightEdgeY - leftEdgeY, 2));

    // 設定4:3的比例
    const boxHeight = faceWidth*2.5;
    const boxWidth = (boxHeight * 3) / 4;

    // 計算矩形框的左上角座標
    const startX = centerX - (boxWidth / 2);
    const startY = centerY - (boxHeight / 2)-25;

    // 保存矩形框的座標
    boxCoordinates = {startX, startY, boxWidth, boxHeight};

    // 繪製4:3的矩形框
    canvasCtx1.strokeStyle = 'white';
    canvasCtx1.lineWidth = 4;
    canvasCtx1.strokeRect(startX, startY, boxWidth, boxHeight);
  }
  canvasCtx1.restore();
}

captureBtn.addEventListener('click', () => {

  if (boxCoordinates) {
    const {startX, startY, boxWidth, boxHeight} = boxCoordinates;
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = boxWidth;
    tempCanvas.height = boxHeight;

    tempCtx.drawImage(out1, startX, startY, boxWidth, boxHeight, 0, 0, boxWidth, boxHeight);
    const dataURL = tempCanvas.toDataURL('image/png');
    
    capturedImageContainer.innerHTML = '';
    const capturedImage = document.createElement('img');
    capturedImage.src = dataURL;
    capturedImageContainer.appendChild(capturedImage);

    shoted.style.display = 'block';
    out1.style.display = 'none';

    shot_bar[0].style.display = 'none';
    shoted_bar[0].style.display = 'block';

  } else {
    console.log('No face detected to capture.');
  }
});


function reShot() {
  shoted.style.display = 'none';
  out1.style.display = 'block';

  shot_bar[0].style.display = 'block';
  shoted_bar[0].style.display = 'none';
}


reshot.addEventListener('click', () => {

  reShot()

});

savephoto.addEventListener('click', () => {
  const img = capturedImageContainer.querySelector('img');
  if (img) {
    const a = document.createElement('a');
    a.href = img.src;
    a.download = now_filename + '.png';
    document.body.appendChild(a); // 必須將 <a> 元素附加到文檔中，才能觸發點擊事件
    a.click();
    document.body.removeChild(a); // 點擊後移除 <a> 元素
  } else {
    console.log('No image found to download.');
  }
});



// file name

const checkboxes = document.querySelectorAll('fieldset input[type="checkbox"]');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', handleChange);
});

function handleChange(event) {
  const { id, checked } = event.target; 
  console.log(`Checkbox with id: ${id} changed to ${checked ? 'checked' : 'unchecked'}`);

  const checkboxes = document.querySelectorAll('fieldset input[type="checkbox"]');

  const checkedIds = Array.from(checkboxes) // Convert NodeList to Array to use filter and map
    .filter(checkbox => checkbox.checked) // Keep only checked checkboxes
    .map(checkbox => checkbox.id); // Extract the id of each checked checkbox

  console.log('Checked checkboxes:', checkedIds);

  chchange = ['班級', '學號' , '座號' ,'學生姓名', '證照號碼',] ;
  enname = ['class', 'sid' , 'sitnu' ,'name', 'id',] ;
  addch = ['班', '' , '號' ,'', '']

  now_filename = '';

  for (let i = 0; i < checkedIds.length; i++) {
    for (let j = 0; j < enname.length; j++) {
      if (checkedIds[i] === enname[j]) {
        now_filename += Json[chchange[j]] + addch[j] + '-';
      }
    }
  }
  now_filename = now_filename.slice(0, -1); // Remove the last hyphen

  if (document.getElementById('student-information').innerHTML != '尚未選擇學生'){
    document.getElementById('student-information').innerHTML = now_filename;
  }

}



const faceDetection = new FaceDetection({locateFile: (file) => {
  return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
}});

faceDetection.onResults(onResultsFace);

const camera = new Camera(video1, {
  onFrame: async () => {
    await faceDetection.send({image: video1});
  },
  width: 480,
  height: 480
});
camera.start();

window.addEventListener('resize', adjustCanvasSize);
adjustCanvasSize();
