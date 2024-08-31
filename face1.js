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
let faceDetected = false;

function onResultsFace(results) {
    document.body.classList.add('loaded');
    canvasCtx1.clearRect(0, 0, out1.width, out1.height);
    canvasCtx1.drawImage(results.image, 0, 0, out1.width, out1.height); // 先绘制图像

    if (results.detections.length > 0) {
        faceDetected = true;

        const leftEdge = results.detections[0].landmarks[4];  // 左臉邊緣
        const rightEdge = results.detections[0].landmarks[5]; // 右臉邊緣

        const leftEdgeX = leftEdge.x * out1.width;
        const leftEdgeY = leftEdge.y * out1.height;
        const rightEdgeX = rightEdge.x * out1.width;
        const rightEdgeY = rightEdge.y * out1.height;

        const centerX = (leftEdgeX + rightEdgeX) / 2;
        const centerY = (leftEdgeY + rightEdgeY) / 2 - 30;

        let faceWidth = Math.sqrt(Math.pow(rightEdgeX - leftEdgeX, 2) + Math.pow(rightEdgeY - leftEdgeY, 2));

        // 先将宽度调整为5的倍数
        let boxWidth = Math.ceil(faceWidth * 1.65);
        if (boxWidth % 5 !== 0) {
            boxWidth += 5 - (boxWidth % 5);
        }

        // 然后计算1.2倍的高度
        let boxHeight = Math.round(boxWidth * 1.2);

        const startX = centerX - (boxWidth / 2);
        const startY = centerY - (boxHeight / 2);

        boxCoordinates = { startX, startY, boxWidth, boxHeight };


        const isOutOfBounds = startX < 0 || startY < 0 || startX + boxWidth > out1.width || startY + boxHeight > out1.height;

        if (isOutOfBounds) {

            canvasCtx1.strokeStyle = 'orange';
            captureBtn.disabled = true
        } else {

            canvasCtx1.strokeStyle = 'white';
            captureBtn.disabled = false;
        }

        canvasCtx1.lineWidth = 4;
        canvasCtx1.strokeRect(startX-3, startY-3, boxWidth+6, boxHeight+6);
    } else {
        captureBtn.disabled = false; 
        faceDetected = false;

        let boxWidth = 200 * 1.6;
        if (boxWidth % 5 !== 0) {
            boxWidth += 5 - (boxWidth % 5);
        }
        let boxHeight = Math.round(boxWidth * 1.2);

        const centerX = out1.width / 2;
        const centerY = out1.height / 2;

        const startX = centerX - (boxWidth / 2);
        const startY = centerY - (boxHeight / 2);

        boxCoordinates = { startX, startY, boxWidth, boxHeight };

        canvasCtx1.strokeStyle = 'red';
        canvasCtx1.lineWidth = 4;
        canvasCtx1.strokeRect(startX-3, startY-3, boxWidth+6, boxHeight+6);
        canvasCtx1.font = '24px Arial';
        canvasCtx1.fillStyle = 'red';
        canvasCtx1.fontWeight = 'bold';
        canvasCtx1.fillText('無法偵測人臉-可自行對準', startX  + 10, startY + boxHeight+6 +30);
    }
}

captureBtn.addEventListener('click', () => {
    if (boxCoordinates) {
        const { startX, startY, boxWidth, boxHeight } = boxCoordinates;
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');

        tempCanvas.width = boxWidth;
        tempCanvas.height = boxHeight;

        // 裁切图片内容，不包含框框
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
        console.log('No face detected and no manual frame to capture.');
    }
    saved = false;
    console.log('Saved status:---------------------------------', saved);

});

function reShot() {
    shoted.style.display = 'none';
    out1.style.display = 'block';

    shot_bar[0].style.display = 'block';
    shoted_bar[0].style.display = 'none';
}

reshot.addEventListener('click', () => {
    reShot();
});

// 保存學生照片後的處理
savephoto.addEventListener('click', () => {
  const img = capturedImageContainer.querySelector('img');
  if (img) {
      now_filename = document.getElementById('student-information').innerHTML;
      const a = document.createElement('a');
      a.href = img.src;
      a.download = now_filename + "--" + nowID.toString() +'.png';
      document.body.appendChild(a); // 必須將 <a> 元素附加到文檔中，才能觸發點擊事件
      a.click();
      document.body.removeChild(a); // 點擊後移除 <a> 元素
      
      // 保存學生信息到 cookies，保存30天
      setCookie(nowID, "saved", 30);
      saved = true;
      console.log('Saved status:---------------------------------');
      console.log(nowID);

      // 在學生列表中顯示 "(已拍攝)"
      var studentButton = document.getElementById(nowID);
      if (studentButton && !studentButton.innerHTML.includes('(已拍攝)')) {
          studentButton.innerHTML += " (已拍攝)";
      }
  } else {
      console.log('No image found to download.');
  }
});


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

    chchange = ['班級', '學號', '座號', '學生姓名', '證照號碼',];
    enname = ['class', 'sid', 'sitnu', 'name', 'id',];
    addch = ['班', '', '號', '', ''];

    now_filename = '';

    for (let i = 0; i < checkedIds.length; i++) {
        for (let j = 0; j < enname.length-1; j++) {
            if (checkedIds[i] === enname[j]) {
                now_filename += Json[chchange[j]] + addch[j] + '--';
            }
        }
    }
    now_filename = now_filename.slice(0, -1); // Remove the last hyphen

    if (document.getElementById('student-information').innerHTML != '尚未選擇學生') {
        document.getElementById('student-information').innerHTML = now_filename;
    }
}

const faceDetection = new FaceDetection({ locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.0/${file}`;
}});





faceDetection.onResults(onResultsFace);

// 獲取當前頁面的 URL
const url = new URL(window.location.href);

// 使用 URLSearchParams 來讀取查詢參數
const params = new URLSearchParams(url.search);

const id = params.get('id'); // 從 URL 參數中獲取 id

// 輸出 id 的值
console.log(id);

const videoElement = document.getElementById('video1'); // 假設你有這個 HTML 元素

navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    console.log(videoDevices);

    if (videoDevices.length === 0) {
      console.error('找不到攝像頭');
      return;
    }

    const selectedCameraId = videoDevices[id].deviceId; // 選擇指定的攝像頭
    console.log(selectedCameraId);

    // 根據選定的攝像頭 ID 獲取視頻流
    navigator.mediaDevices.getUserMedia({
      video: {
        deviceId: selectedCameraId,  // 使用指定的攝像頭
        width: 480,                  // 設置視頻的寬度
        height: 480                  // 設置視頻的高度
      }
    })
    .then(stream => {
      // 將攝像頭的視頻流設置為 video 元素的來源
      videoElement.srcObject = stream;
      videoElement.play();

      // 定義每幀進行檢測的函數
      const detectFace = async () => {
        // 使用 faceDetection 處理 video 元素的畫面
        await faceDetection.send({ image: videoElement });
        requestAnimationFrame(detectFace); // 在下一幀時繼續檢測
      };

      // 當視頻準備好時，開始進行檢測
      videoElement.onloadedmetadata = () => {
        console.log('視頻已準備好，開始進行人臉檢測');
        detectFace(); // 開始檢測循環
      };
    })
    .catch(error => {
      console.error('無法獲取攝像頭視頻流:', error);
    });
  })
  .catch(error => {
    console.error('無法獲取設備:', error);
  });




window.addEventListener('resize', adjustCanvasSize);
adjustCanvasSize();
