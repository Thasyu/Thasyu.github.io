document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");

  // 🌸 ページロード後にフェードアウト
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => (loadingScreen.style.display = "none"), 800);
  }, 1200); // 1.2秒後に消える
});
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(30,30);

const nextCanvas = document.getElementById('next');
const nextCtx = nextCanvas.getContext('2d');
nextCtx.scale(30,30);

const ROWS = 20;
const COLS = 10;

let arena = createMatrix(COLS, ROWS);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let level = 1;
let linesCleared = 0;

let gameOver = false;
let gameRunning = false; // ← スタート中かどうか管理

let player = {
  pos: {x:0, y:0},
  matrix: null,
  next: null
};

// ブロック定義
const pieces = 'TJLOSZI';
function createPiece(type){
  switch(type){
    case 'T': return [[0,1,0],[1,1,1],[0,0,0]];
    case 'O': return [[2,2],[2,2]];
    case 'L': return [[0,0,3],[3,3,3],[0,0,0]];
    case 'J': return [[4,0,0],[4,4,4],[0,0,0]];
    case 'I': return [[0,0,0,0],[5,5,5,5],[0,0,0,0],[0,0,0,0]];
    case 'S': return [[0,6,6],[6,6,0],[0,0,0]];
    case 'Z': return [[7,7,0],[0,7,7],[0,0,0]];
  }
}

const colors = [null,'#ff69b4','#ffb6c1','#ff1493','#ff7f50','#ff4500','#ff00ff','#ff6347'];

function createMatrix(w,h){
  const matrix=[];
  while(h--) matrix.push(new Array(w).fill(0));
  return matrix;
}

function drawMatrix(matrix,offset,ctx){
  matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0){
        ctx.fillStyle=colors[value];
        ctx.fillRect(x+offset.x, y+offset.y,1,1);
        ctx.strokeStyle='#fff';
        ctx.lineWidth=0.05;
        ctx.strokeRect(x+offset.x, y+offset.y,1,1);
      }
    });
  });
}

function drawGrid(ctx, cols, rows){
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  const width = ctx.canvas.width / cols;
  const height = ctx.canvas.height / rows;
  ctx.strokeStyle = 'rgba(255,182,193,0.6)';
  ctx.lineWidth = 2;

  for(let x=0; x<=cols; x++){
    ctx.beginPath();
    ctx.moveTo(x*width,0);
    ctx.lineTo(x*width,ctx.canvas.height);
    ctx.stroke();
  }
  for(let y=0; y<=rows; y++){
    ctx.beginPath();
    ctx.moveTo(0,y*height);
    ctx.lineTo(ctx.canvas.width, y*height);
    ctx.stroke();
  }
  ctx.restore();
}

function playerMove(dir){
  if(!gameRunning || gameOver) return;
  player.pos.x += dir;
  if(collide(arena,player)) player.pos.x -= dir;
}

function collide(arena,player){
  const [m,o] = [player.matrix,player.pos];
  for(let y=0;y<m.length;y++){
    for(let x=0;x<m[y].length;x++){
      if(m[y][x]!==0 &&
        (arena[y+o.y] && arena[y+o.y][x+o.x])!==0){
          return true;
        }
    }
  }
  return false;
}

function merge(arena,player){
  player.matrix.forEach((row,y)=>{
    row.forEach((value,x)=>{
      if(value!==0) arena[y+player.pos.y][x+player.pos.x] = value;
    });
  });
}

function arenaSweep(){
  let rowCount=1;
  outer: for(let y=arena.length-1;y>=0;y--){
    for(let x=0;x<arena[y].length;x++){
      if(arena[y][x]===0) continue outer;
    }
    const row=arena.splice(y,1)[0].fill(0);
    arena.unshift(row);
    score += rowCount*10;
    linesCleared++;
    if(linesCleared%10===0){
      level++;
      dropInterval *= 0.9;
    }
    rowCount *= 2;
    createParticles();
    updateScore();
  }
}

function createParticles(){
  const container=document.createElement('div');
  container.style.position='fixed';
  container.style.top='0';
  container.style.left='0';
  container.style.width='100%';
  container.style.height='100%';
  container.style.pointerEvents='none';
  document.body.appendChild(container);

  for(let i=0;i<100;i++){
    const p=document.createElement('div');
    p.style.position='absolute';
    p.style.width='6px';
    p.style.height='6px';
    p.style.borderRadius='50%';
    p.style.backgroundColor=colors[Math.floor(Math.random()*colors.length)] || '#fff';
    p.style.left=Math.random()*window.innerWidth+'px';
    p.style.top=Math.random()*window.innerHeight+'px';
    p.style.transform='translate(0,0)';
    p.style.opacity=1;
    p.style.animation='sparkle 1s ease-out forwards';
    p.style.setProperty('--dx',(Math.random()-0.5)*200+'px');
    p.style.setProperty('--dy',(Math.random()-0.5)*200+'px');
    container.appendChild(p);
  }
  setTimeout(()=>document.body.removeChild(container),1000);
}

function updateScore(){
  document.getElementById('score').innerText=score;
  document.getElementById('level').innerText=level;
}

function playerDrop(){
  if(!gameRunning || gameOver) return;
  player.pos.y++;
  if(collide(arena,player)){
    player.pos.y--;
    merge(arena,player);
    resetPlayer();
    arenaSweep();
  }
  dropCounter=0;
}

function hardDrop(){
  if(!gameRunning || gameOver) return;
  while(!collide(arena,player)) player.pos.y++;
  player.pos.y--;
  merge(arena,player);
  resetPlayer();
  arenaSweep();
  dropCounter=0;
}

function playerRotate(clockwise=true){
  if(!gameRunning || gameOver) return;
  const pos = player.pos.x;
  let offset=1;
  rotate(player.matrix,clockwise);
  while(collide(arena,player)){
    player.pos.x += offset;
    offset = -(offset + (offset>0?1:-1));
    if(offset>player.matrix[0].length){
      rotate(player.matrix,!clockwise);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix,clockwise=true){
  for(let y=0;y<matrix.length;y++){
    for(let x=0;x<y;x++){
      [matrix[x][y],matrix[y][x]]=[matrix[y][x],matrix[x][y]];
    }
  }
  if(clockwise) matrix.forEach(row=>row.reverse());
  else matrix.reverse();
}

function draw(){
  context.fillStyle='#fff0f5';
  context.fillRect(0,0,canvas.width,canvas.height);

  drawGrid(context, COLS, ROWS);
  drawMatrix(arena,{x:0,y:0},context);
  drawMatrix(player.matrix,player.pos,context);
}

function drawNext(){
  nextCtx.fillStyle='#fff0f5';
  nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
  drawMatrix(player.next,{x:0,y:0},nextCtx);
}

function resetPlayer(){
  player.matrix=player.next||createPiece(pieces[Math.floor(Math.random()*pieces.length)]);
  player.next=createPiece(pieces[Math.floor(Math.random()*pieces.length)]);
  player.pos.y=0;
  player.pos.x=Math.floor(arena[0].length/2)-Math.floor(player.matrix[0].length/2);
  if(collide(arena,player)){
    endGame(); // 🎯 ゲームオーバー処理呼び出し
  }
  drawNext();
}

function endGame(){
  gameOver = true;
  gameRunning = false;

  // スコアボードを強調 ✨
  const scoreBoard = document.querySelector('.scoreboard');
  scoreBoard.classList.add('highlight');

  console.log('🎮 Game Over! スタートボタンを押すと再開できます。');
}

function update(time=0){
  if(!gameRunning || gameOver) return;
  const deltaTime=time-lastTime;
  lastTime=time;
  dropCounter += deltaTime;
  if(dropCounter>dropInterval) playerDrop();
  draw();
  requestAnimationFrame(update);
}

// 🎮 スタートボタン
document.getElementById('start-btn').addEventListener('click', () => {
  if (!gameRunning) {
    gameOver = false;
    gameRunning = true;
    arena.forEach(row => row.fill(0));
    score = 0;
    level = 1;
    linesCleared = 0;
    dropInterval = 1000;
    updateScore();

    const scoreBoard = document.querySelector('.scoreboard');
    scoreBoard.classList.remove('highlight');

    resetPlayer();
    lastTime = performance.now();
    update();
  }
});

// 🔄 リセットボタン
document.getElementById('reset-btn').addEventListener('click', () => {
  arena.forEach(row=>row.fill(0));
  score=0;
  level=1;
  linesCleared=0;
  dropInterval=1000;
  gameRunning=false;
  gameOver=false;
  updateScore();
  resetPlayer();
  draw();

  const scoreBoard = document.querySelector('.scoreboard');
  scoreBoard.classList.remove('highlight');
});

// 🧭 操作キー
document.addEventListener('keydown', event=>{
  switch(event.key.toUpperCase()){
    case 'A': playerMove(-1); break;
    case 'D': playerMove(1); break;
    case 'S': playerDrop(); break;
    case 'W': hardDrop(); break;
    case 'Q': playerRotate(false); break;
    case 'E': playerRotate(true); break;
  }
});

// 📱 スマホ操作
document.querySelectorAll('.controls button').forEach(btn=>{
  btn.addEventListener('click',()=>{
    switch(btn.dataset.action){
      case 'left': playerMove(-1); break;
      case 'right': playerMove(1); break;
      case 'down': playerDrop(); break;
      case 'drop': hardDrop(); break;
      case 'rotate-left': playerRotate(false); break;
      case 'rotate-right': playerRotate(true); break;
    }
  });
});

// 📘 ルール折りたたみ
document.querySelector('.toggle-btn').addEventListener('click',()=>{
  const content = document.querySelector('.rule-content');
  if(content.style.maxHeight) content.style.maxHeight=null;
  else content.style.maxHeight=content.scrollHeight+'px';
});

// 初期表示
resetPlayer();
draw();

const particleCount = 20; // 粒の数
const container = document.querySelector('.particles');

for (let i = 0; i < particleCount; i++) {
  const span = document.createElement('span');

  // ランダムな位置
  span.style.top = `${Math.random() * 100}%`;
  span.style.left = `${Math.random() * 100}%`;

  // ランダムなサイズ
  const size = 2 + Math.random() * 4; // 2px〜6px
  span.style.width = `${size}px`;
  span.style.height = `${size}px`;

  // ランダムなアニメーション時間
  span.style.animationDuration = `${3 + Math.random() * 4}s`; // 3〜7秒

  // ランダムなアニメーション遅延
  span.style.animationDelay = `${Math.random() * 5}s`;

  container.appendChild(span);
}
