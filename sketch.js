const STOP_SHEET_PATH = "1/1 stop/stop.png"; // 設定角色1待機精靈表的圖片路徑
const WALK_SHEET_PATH = "1/5 walk/walk.png"; // 設定角色1走路精靈表的圖片路徑
const MAGIC_SHEET_PATH = "1/3magic/magic.png"; // 設定角色1施法精靈表的圖片路徑
const EFFECT_SHEET_PATH = "1/4/to.png"; // 設定施法飛行特效精靈表的圖片路徑
const STOP_FRAME_COUNT = 10; // 設定待機精靈表中的影格數量
const STOP_FRAME_WIDTH = 139.5; // 設定待機影格的原始寬度
const STOP_FRAME_HEIGHT = 196; // 設定待機影格的原始高度
const WALK_FRAME_COUNT = 8; // 設定走路精靈表中的影格數量
const WALK_FRAME_WIDTH = 1107 / WALK_FRAME_COUNT; // 依精靈表總寬計算每張走路影格的寬度
const WALK_FRAME_HEIGHT = 197; // 設定走路影格的原始高度
const MAGIC_FRAME_COUNT = 12; // 設定施法精靈表中的影格數量
const MAGIC_FRAME_WIDTH = 3127 / MAGIC_FRAME_COUNT; // 依精靈表總寬計算每張施法影格的寬度
const MAGIC_FRAME_HEIGHT = 188; // 設定施法影格的原始高度
const EFFECT_FRAME_COUNT = 5; // 設定飛行特效精靈表中的影格數量
const EFFECT_FRAME_WIDTH = 740 / EFFECT_FRAME_COUNT; // 依精靈表總寬計算每張特效影格的寬度
const EFFECT_FRAME_HEIGHT = 19; // 設定特效影格的原始高度
const FRAME_DURATION = 100; // 設定每張動畫影格顯示100毫秒
const MOVE_SPEED = 240; // 設定角色每秒移動的像素數
const EFFECT_SPEED = 520; // 設定特效每秒移動的像素數
let stopSheet; // 宣告變數以保存角色待機精靈表
let walkSheet; // 宣告變數以保存角色走路精靈表
let magicSheet; // 宣告變數以保存角色施法精靈表
let effectSheet; // 宣告變數以保存飛行特效精靈表
let characterX; // 宣告變數以保存角色中心的水平位置
let movementDirection = 0; // 記錄移動方向，零代表角色停止移動
let facingDirection = 1; // 記錄角色面向方向，正數向右、負數向左
let lastMoveTime = 0; // 記錄上次更新角色位置的時間
let hasStartedWalking = false; // 記錄角色是否已按過方向鍵並進入走路動畫
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartedAt = 0; // 記錄施法動畫開始播放的時間
let castDirection = 1; // 記錄施法開始時角色面向的方向
let effects = []; // 保存目前畫面中所有飛行中的特效
function preload() { // 在畫布建立前載入角色動畫圖片
  stopSheet = loadImage(STOP_SHEET_PATH); // 載入角色1的十格待機精靈表
  walkSheet = loadImage(WALK_SHEET_PATH); // 載入角色1的八格走路精靈表
  magicSheet = loadImage(MAGIC_SHEET_PATH); // 載入角色1的十二格施法精靈表
  effectSheet = loadImage(EFFECT_SHEET_PATH); // 載入五格飛行特效精靈表
} // 結束圖片預載函式
function setup() { // 設定畫布與角色初始位置
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗大小的全螢幕畫布
  imageMode(CENTER); // 讓角色圖片以指定位置作為中心點繪製
  frameRate(60); // 設定畫面更新頻率以維持流暢繪製
  characterX = (width * 2) / 3; // 將角色初始中心放在畫布寬度的三分之二處
  lastMoveTime = millis(); // 初始化角色移動計時器
} // 結束畫布設定函式
function draw() { // 每個畫面更新時繪製背景與角色
  background("skyblue"); // 將畫布背景設為天藍色
  const currentTime = millis(); // 取得目前經過的毫秒數
  const castingFinished = isCasting && currentTime - magicStartedAt >= MAGIC_FRAME_COUNT * FRAME_DURATION; // 判斷一次性施法動畫是否已播放完畢
  if (castingFinished) { // 施法動畫結束時建立一個飛行特效
    isCasting = false; // 結束施法狀態並切回待機或走路動畫
  } // 結束施法動畫完成判斷
  const isWalking = hasStartedWalking; // 判斷角色是否已按過方向鍵並持續播放走路動畫
  const activeSheet = isCasting ? magicSheet : isWalking ? walkSheet : stopSheet; // 依角色狀態選擇施法、走路或待機精靈表
  const frameCount = isCasting ? MAGIC_FRAME_COUNT : isWalking ? WALK_FRAME_COUNT : STOP_FRAME_COUNT; // 依角色狀態選擇影格總數
  const frameWidth = isCasting ? MAGIC_FRAME_WIDTH : isWalking ? WALK_FRAME_WIDTH : STOP_FRAME_WIDTH; // 依角色狀態選擇影格寬度
  const frameHeight = isCasting ? MAGIC_FRAME_HEIGHT : isWalking ? WALK_FRAME_HEIGHT : STOP_FRAME_HEIGHT; // 依角色狀態選擇影格高度
  const animationTime = isCasting ? currentTime - magicStartedAt : currentTime; // 施法動畫從起始時間播放，其餘動畫持續循環
  const currentFrame = isCasting ? min(MAGIC_FRAME_COUNT - 1, floor(animationTime / FRAME_DURATION)) : floor(animationTime / FRAME_DURATION) % frameCount; // 計算目前應顯示的動畫影格
  const scaleFactor = min(1, height / frameHeight, width / frameWidth); // 依畫布大小縮放角色並避免影格超出畫布
  const displayWidth = frameWidth * scaleFactor; // 計算角色影格縮放後的寬度
  const displayHeight = frameHeight * scaleFactor; // 計算角色影格縮放後的高度
  const halfWidth = displayWidth / 2; // 計算角色影格的一半寬度以限制移動邊界
  const elapsedSeconds = (currentTime - lastMoveTime) / 1000; // 計算距離上次位置更新的秒數
  characterX += movementDirection * MOVE_SPEED * elapsedSeconds; // 依移動方向與經過時間更新角色水平位置
  lastMoveTime = currentTime; // 更新位置計算所使用的時間
  if (characterX >= width - halfWidth) { // 判斷角色是否已到達畫布最右端
    characterX = width - halfWidth; // 將角色停在畫布最右側邊界
    movementDirection = 0; // 到達右側邊界後停止水平移動
  } // 結束右側邊界判斷
  if (characterX <= halfWidth) { // 判斷角色是否已到達畫布最左端
    characterX = halfWidth; // 將角色停在畫布最左側邊界
    movementDirection = 0; // 到達左側邊界後停止水平移動
  } // 結束左側邊界判斷
  const centerY = height - displayHeight / 2; // 將角色影格底邊對齊畫布底部
  if (castingFinished) { // 施法動畫完整播放後發射飛行特效
    const effectScale = min(1, width / EFFECT_FRAME_WIDTH, height / EFFECT_FRAME_HEIGHT); // 依畫布大小計算特效顯示比例
    const effectWidth = EFFECT_FRAME_WIDTH * effectScale; // 計算特效影格縮放後的寬度
    effects.push({ x: characterX + castDirection * (halfWidth + effectWidth / 2), y: centerY - displayHeight * 0.15, direction: castDirection }); // 從角色前方建立朝施法方向移動的特效
  } // 結束特效建立判斷
  push(); // 暫存繪圖狀態以便只翻轉角色圖片
  translate(characterX, centerY); // 將繪圖原點移至角色中心位置
  scale(facingDirection, 1); // 面向左方時水平翻轉角色圖片
  image(activeSheet, 0, 0, displayWidth, displayHeight, currentFrame * frameWidth, 0, frameWidth, frameHeight); // 裁切目前影格並繪製角色動畫
  pop(); // 還原繪圖狀態避免影響其他畫面
  const effectScale = min(1, width / EFFECT_FRAME_WIDTH, height / EFFECT_FRAME_HEIGHT); // 依畫布大小計算特效顯示比例
  const effectWidth = EFFECT_FRAME_WIDTH * effectScale; // 計算特效影格縮放後的寬度
  const effectHeight = EFFECT_FRAME_HEIGHT * effectScale; // 計算特效影格縮放後的高度
  for (let index = effects.length - 1; index >= 0; index--) { // 逐一更新並繪製所有飛行特效
    const effect = effects[index]; // 取得目前處理中的特效
    effect.x += effect.direction * EFFECT_SPEED * elapsedSeconds; // 依施法方向更新特效的水平位置
    if (effect.direction > 0 && effect.x - effectWidth / 2 > width || effect.direction < 0 && effect.x + effectWidth / 2 < 0) { // 判斷特效是否已完全離開畫布
      effects.splice(index, 1); // 移除已離開畫布的特效
      continue; // 略過已移除特效的繪製
    } // 結束特效離開畫布判斷
    const effectFrame = floor(currentTime / FRAME_DURATION) % EFFECT_FRAME_COUNT; // 循環播放特效的五張影格
    push(); // 暫存繪圖狀態以便翻轉朝左移動的特效
    translate(effect.x, effect.y); // 將繪圖原點移至特效目前位置
    scale(effect.direction, 1); // 朝左移動時水平翻轉特效圖片
    image(effectSheet, 0, 0, effectWidth, effectHeight, effectFrame * EFFECT_FRAME_WIDTH, 0, EFFECT_FRAME_WIDTH, EFFECT_FRAME_HEIGHT); // 裁切目前特效影格並繪製
    pop(); // 還原繪圖狀態以免影響其他畫面
  } // 結束飛行特效更新與繪製
} // 結束畫面繪製函式
function keyPressed() { // 按下方向鍵或空白鍵時控制角色
  if (key === " ") { // 判斷使用者是否按下空白鍵
    if (!isCasting) { // 僅在目前沒有施法時開始一次新的施法動畫
      isCasting = true; // 切換至施法動畫狀態
      magicStartedAt = millis(); // 記錄施法動畫開始播放的時間
      castDirection = facingDirection; // 記住施法當下角色面向的方向
    } // 結束施法啟動判斷
    return false; // 阻止空白鍵捲動瀏覽器頁面
  } // 結束空白鍵判斷
  if (keyCode === RIGHT_ARROW) { // 判斷使用者是否按下右方向鍵
    movementDirection = 1; // 設定角色往畫布右側移動
    facingDirection = 1; // 設定角色面向右側
    hasStartedWalking = true; // 切換至持續播放的走路動畫
    return false; // 阻止方向鍵捲動瀏覽器頁面
  } // 結束右方向鍵判斷
  if (keyCode === LEFT_ARROW) { // 判斷使用者是否按下左方向鍵
    movementDirection = -1; // 設定角色往畫布左側移動
    facingDirection = -1; // 設定角色面向左側
    hasStartedWalking = true; // 切換至持續播放的走路動畫
    return false; // 阻止方向鍵捲動瀏覽器頁面
  } // 結束左方向鍵判斷
} // 結束方向鍵處理函式
function windowResized() { // 視窗尺寸改變時同步調整畫布與角色位置
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為最新的視窗寬度與高度
  characterX = constrain(characterX, 0, width); // 避免調整視窗後角色中心超出畫布
} // 結束視窗尺寸調整函式
