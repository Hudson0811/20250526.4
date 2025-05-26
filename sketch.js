let video;
let facemesh;
let handpose;
let predictions = [];
let handPredictions = [];
let gesture = ""; // 儲存手勢結果
let maskImage; // 儲存面具圖片

function preload() {
  // 載入面具圖片
  maskImage = loadImage("Cute-Japanese-fox-mask-Cute-mask-Red-line-pattern_239641_wh1200.png"); // 確保圖片檔名與路徑正確
}

function setup() {
  createCanvas(640, 480).position(
    (windowWidth - 640) / 2,
    (windowHeight - 480) / 2
  );
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  facemesh = ml5.facemesh(video, modelReady);
  facemesh.on('predict', results => {
    predictions = results;
  });

  handpose = ml5.handpose(video, modelReady);
  handpose.on('predict', results => {
    handPredictions = results;
    detectGesture();
  });
}

function modelReady() {
  console.log("模型載入完成");
}

function draw() {
  image(video, 0, 0, width, height);

  if (predictions.length > 0) {
    const keypoints = predictions[0].scaledMesh;

    // 根據手勢移動圓圈位置
    let x, y;
    if (gesture === "rock") {
      // 額頭 (第10點)
      [x, y] = keypoints[10];
    } else if (gesture === "scissors") {
      // 左眼 (第33點)
      [x, y] = keypoints[33];
    } else if (gesture === "paper") {
      // 左臉頰 (第234點)
      [x, y] = keypoints[234];
    } else {
      // 預設位置 (第94點)
      [x, y] = keypoints[94];
    }

    // 繪製圓圈
    noFill();
    stroke(255, 0, 0);
    strokeWeight(4);
    ellipse(x, y, 100, 100);

    // 繪製面具
    drawMask(keypoints);
  } else {
    console.log("沒有臉部辨識結果");
  }
}

// 手勢辨識邏輯
function detectGesture() {
  if (handPredictions.length > 0) {
    const landmarks = handPredictions[0].landmarks;

    // 簡單手勢辨識：剪刀、石頭、布
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];

    const thumbIndexDist = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    const indexMiddleDist = dist(indexTip[0], indexTip[1], middleTip[0], middleTip[1]);
    const middleRingDist = dist(middleTip[0], middleTip[1], ringTip[0], ringTip[1]);

    if (thumbIndexDist < 30 && indexMiddleDist < 30 && middleRingDist < 30) {
      gesture = "rock"; // 石頭
    } else if (indexMiddleDist > 50 && middleRingDist > 50) {
      gesture = "scissors"; // 剪刀
    } else {
      gesture = "paper"; // 布
    }

    console.log("偵測到手勢:", gesture);
  } else {
    console.log("沒有手部辨識結果");
  }
}

// 繪製面具的函式
function drawMask(keypoints) {
  // 取得左右眼的關鍵點
  const leftEye = keypoints[33]; // 左眼
  const rightEye = keypoints[263]; // 右眼
  const nose = keypoints[168]; // 鼻子

  // 計算面具的寬度與高度
  const maskWidth = dist(leftEye[0], leftEye[1], rightEye[0], rightEye[1]) * 2;
  const maskHeight = maskWidth * 1.2;

  // 計算面具的中心點（以鼻子為基準）
  const maskX = nose[0] - maskWidth / 2;
  const maskY = nose[1] - maskHeight / 2;

  // 繪製面具圖片
  image(maskImage, maskX, maskY, maskWidth, maskHeight);
}
