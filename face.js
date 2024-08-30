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


        // 检查框框是否超出画布边界
        const isOutOfBounds = startX < 0 || startY < 0 || startX + boxWidth > out1.width || startY + boxHeight > out1.height;

        if (isOutOfBounds) {
            // 框框超出边界，变为橘色，并禁用拍摄按钮
            canvasCtx1.strokeStyle = 'orange';
            captureBtn.disabled = true; // 禁用拍摄按钮
        } else {
            // 框框在边界内，保持白色，并启用拍摄按钮
            canvasCtx1.strokeStyle = 'white';
            captureBtn.disabled = false; // 启用拍摄按钮
        }

        canvasCtx1.lineWidth = 4;
        canvasCtx1.strokeRect(startX-3, startY-3, boxWidth+6, boxHeight+6);
    } else {
        faceDetected = false;

        // 没有检测到人脸时，显示一个固定比例的红色框
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

navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    const videoDevices = devices.filter(device => device.kind === 'videoinput');

    // 將所有設備資訊輸出到 console
    console.log('所有可用設備：', videoDevices);

    // 如果要輸出到自定義的 log 檔案，可以使用以下方式：
    const logData = JSON.stringify(videoDevices, null, 2); // 格式化 JSON 資料
    const fs = require('fs'); // 如果在 Node.js 環境中，需要引入 fs 模組
    fs.writeFileSync('device_log.txt', logData);
  })
  .catch(error => {
    console.error('獲取裝置失敗:', error);
  });

// 取得所有裝置
navigator.mediaDevices.enumerateDevices().then(devices => {
    // 找到所有的攝像頭裝置
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    
//     // 確保有至少一個攝像頭
//     if (videoDevices.length > 0) {
//         // 取得第一個或第二個攝像頭的 deviceId
//         const cameraId = videoDevices.length > 1 ? videoDevices[1].deviceId : videoDevices[0].deviceId;
        
//         if (videoDevices.length > 1) {
//             console.log('找到多個攝像頭，使用第二個攝像頭:', videoDevices[1]);
//         } else {
//             console.log('找到一個攝像頭，使用第一個攝像頭:', videoDevices[0]);
//         }

//         // 使用選擇的攝像頭初始化 Camera 實例
//         const camera = new Camera(video1, {
//             onFrame: async () => {
//                 await faceDetection.send({ image: video1 });
//             },
//             width: 480,
//             height: 480,
//             deviceId: cameraId // 設定要使用的攝像頭
//         });
        
//         camera.start();
//     } else {
//         console.error('沒有找到攝像頭');
//     }
// }).catch(error => {
//     console.error('獲取裝置失敗:', error);
// });

document.getElementById('listDevices').addEventListener('click', () => {
    // 請求媒體設備權限
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => {
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        const deviceList = devices.map(device => 
          `${device.kind}: ${device.label || 'No label'} (ID: ${device.deviceId})`
        ).join('\n');
        document.getElementById('deviceList').textContent = deviceList;
        console.log( deviceList);

        // 顯示第一個可用的攝影機
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length > 0) {
          const constraints = {
            video: { deviceId: videoDevices[0].deviceId }
          };
          return navigator.mediaDevices.getUserMedia(constraints);
        }
      })
      .then(stream => {
        const video = document.getElementById('webcam-output');
        video.srcObject = stream;
      })
      .catch(error => {
        console.error('Error:', error);
      });
  });
});


window.addEventListener('resize', adjustCanvasSize);
adjustCanvasSize();
