window.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");
  const leftCurtain = document.querySelector(".curtain.left");
  const rightCurtain = document.querySelector(".curtain.right");
  const gameContainer = document.getElementById("othelloContainer");
  gameContainer.style.display = "none";

  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.style.transition = "opacity 1s ease";
      loadingScreen.style.opacity = "0";
      setTimeout(() => {
        loadingScreen.style.display = "none";
        gameContainer.style.display = "flex";
        leftCurtain.classList.add("isPlay");
        rightCurtain.classList.add("isPlay");
      }, 1000);
    }, 800);
  });

  // --- オセロロジック ---
  const SIZE = 8;
  const boardEl = document.getElementById("board");
  const resetBtn = document.getElementById("resetBtn");
  const resetBtn2 = document.getElementById("resetBtn2");
  const diffButtons = document.querySelectorAll(".difficulty-btn");
  const resultPanel = document.getElementById("resultPanel");
  const resultPanel2 = document.getElementById("resultPanel2");

  let board = [];
  let current = "pink";
  let aiLevel = "easy";
  let gameStarted = false;
  let gameEnded = false;

  const POS_WEIGHTS = [
    [120,-20,20,5,5,20,-20,120],
    [-20,-40,-5,-5,-5,-5,-40,-20],
    [20,-5,15,3,3,15,-5,20],
    [5,-5,3,3,3,3,-5,5],
    [5,-5,3,3,3,3,-5,5],
    [20,-5,15,3,3,15,-5,20],
    [-20,-40,-5,-5,-5,-5,-40,-20],
    [120,-20,20,5,5,20,-20,120],
  ];

  // --- 勝敗メッセージバリエーション ---
  const victoryMessages = [
    "勝利！やったね！", 
    "大勝利！最高！", 
    "ナイスプレイ！", 
    "ピンクの勝ち！", 
    "やった！君の勝ち！"
  ];
  const defeatMessages = [
    "残念、敗北…", 
    "次は勝てる！", 
    "惜しいね!頑張った！", 
    "惜しい！", 
    "次回リベンジ！"
  ];
  const drawMessages = [
    "引き分け！いい勝負！", 
    "お互い頑張ったね！", 
    "いい勝負だった！", 
    "平和な引き分け！", 
    "互角の戦い！"
  ];

  function cloneBoard(b){ return b.map(r=>r.slice()); }

  function initBoard(){
    board = Array.from({length: SIZE}, () => Array(SIZE).fill(null));
    board[3][3] = "white"; board[3][4] = "pink"; board[4][3] = "pink"; board[4][4] = "white";
    current = "pink"; gameStarted = false; gameEnded = false;
    renderBoard(); updateScore();
    if(resultPanel) resultPanel.textContent = "";
    if(resultPanel2) resultPanel2.textContent = "";
  }

  resetBtn.addEventListener("click", initBoard);
  if(resetBtn2) resetBtn2.addEventListener("click", initBoard);
  diffButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      if(gameStarted) return;
      diffButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      aiLevel = btn.dataset.level;
    });
  });

  function renderBoard(){
    boardEl.innerHTML = "";
    for(let y=0; y<SIZE; y++){
      for(let x=0; x<SIZE; x++){
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.x = x; cell.dataset.y = y;
        if(board[y][x]){
          const s = document.createElement("div");
          s.className = `stone ${board[y][x]}`;
          setTimeout(()=>s.classList.add("show"), 15);
          cell.appendChild(s);
        }
        cell.addEventListener("click", ()=>onCellClick(x,y));
        boardEl.appendChild(cell);
      }
    }
  }

  function updateScore(){
    let p=0, w=0;
    for(let r of board){ for(let c of r){ if(c==="pink")p++; if(c==="white")w++; } }
    const pinkScoreEl = document.getElementById("pinkScore");
    const whiteScoreEl = document.getElementById("whiteScore");
    const pinkScoreEl2 = document.getElementById("pinkScore2");
    const whiteScoreEl2 = document.getElementById("whiteScore2");
    if(pinkScoreEl) pinkScoreEl.textContent = p;
    if(whiteScoreEl) whiteScoreEl.textContent = w;
    if(pinkScoreEl2) pinkScoreEl2.textContent = p;
    if(whiteScoreEl2) whiteScoreEl2.textContent = w;
  }

  const DIRS = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];

  function getFlipsForBoard(b,x,y,color){
    if(b[y][x]) return [];
    const opp = color==="pink"?"white":"pink";
    let flips = [];
    for(const [dx,dy] of DIRS){
      let nx=x+dx, ny=y+dy, line=[];
      while(nx>=0 && nx<SIZE && ny>=0 && ny<SIZE){
        if(b[ny][nx]===opp) line.push([nx,ny]);
        else if(b[ny][nx]===color){ if(line.length) flips.push(...line); break; }
        else break;
        nx+=dx; ny+=dy;
      }
    }
    return flips;
  }

  function getValidMovesForBoard(b,color){
    const moves = [];
    for(let y=0;y<SIZE;y++){for(let x=0;x<SIZE;x++){
      const flips = getFlipsForBoard(b,x,y,color);
      if(flips.length) moves.push({x,y,flips});
    }}
    return moves;
  }

  function applyMoveOnBoard(b,x,y,color,flips){ b[y][x]=color; for(const [fx,fy] of flips) b[fy][fx]=color; }
  function getValidMoves(color){ return getValidMovesForBoard(board,color); }

  function evaluateSimple(b,color){
    let my=0,opp=0,score=0; const oppColor=color==="pink"?"white":"pink";
    for(let y=0;y<SIZE;y++){for(let x=0;x<SIZE;x++){
      if(b[y][x]===color){my++; score+=POS_WEIGHTS[y][x];}
      if(b[y][x]===oppColor){opp--; score-=POS_WEIGHTS[y][x];}
    }}
    return my-opp+score*0.01;
  }

  function evaluateHard(b,color){
    const opp=color==="pink"?"white":"pink";
    let val=evaluateSimple(b,color);
    const myMoves=getValidMovesForBoard(b,color).length;
    const oppMoves=getValidMovesForBoard(b,opp).length;
    if(myMoves+oppMoves>0) val += (myMoves-oppMoves)*0.8;
    const corners=[[0,0],[0,7],[7,0],[7,7]];
    for(const [cx,cy] of corners){ if(b[cy][cx]===color) val+=20; if(b[cy][cx]===opp) val-=20; }
    return val;
  }

  function evaluateBoardFor(b,color){ return aiLevel==="hard"?evaluateHard(b,color):evaluateSimple(b,color); }

  function minimaxAB(b,depth,alpha,beta,maximizing,color){
    const curColor = maximizing ? color : (color==="pink"?"white":"pink");
    if(depth===0) return evaluateBoardFor(b,color);
    const moves=getValidMovesForBoard(b,curColor);
    if(moves.length===0){
      const otherMoves=getValidMovesForBoard(b,maximizing?(color==="pink"?"white":"pink"):color);
      if(otherMoves.length===0) return evaluateBoardFor(b,color);
      return minimaxAB(b,depth-1,alpha,beta,!maximizing,color);
    }
    if(maximizing){
      let value=-Infinity;
      for(const m of moves){
        const nb=cloneBoard(b); applyMoveOnBoard(nb,m.x,m.y,curColor,m.flips);
        const score=minimaxAB(nb,depth-1,alpha,beta,false,color);
        value=Math.max(value,score); alpha=Math.max(alpha,value); if(alpha>=beta) break;
      }
      return value;
    } else {
      let value=Infinity;
      for(const m of moves){
        const nb=cloneBoard(b); applyMoveOnBoard(nb,m.x,m.y,curColor,m.flips);
        const score=minimaxAB(nb,depth-1,alpha,beta,true,color);
        value=Math.min(value,score); beta=Math.min(beta,value); if(alpha>=beta) break;
      }
      return value;
    }
  }

  function pickAIMove(){
    const moves=getValidMoves("white");
    if(moves.length===0) return null;
    if(aiLevel==="easy") return moves[Math.floor(Math.random()*moves.length)];
    const depth=aiLevel==="normal"?2:5;
    let best=null, bestScore=-Infinity;
    for(const m of moves){
      const nb=cloneBoard(board); applyMoveOnBoard(nb,m.x,m.y,"white",m.flips);
      const score=minimaxAB(nb,depth-1,-Infinity,Infinity,false,"white");
      if(score>bestScore){bestScore=score; best=m;}
    }
    return best;
  }

  function onCellClick(x,y){
    if(gameEnded) return;
    const valid=getValidMovesForBoard(board,"pink").find(m=>m.x===x && m.y===y);
    if(!valid) return;
    gameStarted=true;
    applyMoveOnBoard(board,x,y,"pink",valid.flips);
    renderBoard(); updateScore(); setTimeout(()=>aiTurn(),220);
  }

  function aiTurn(){
    if(gameEnded) return;
    const move=pickAIMove();
    if(!move){ if(getValidMoves("pink").length===0) return finishGame(); return; }
    applyMoveOnBoard(board,move.x,move.y,"white",move.flips);
    renderBoard(); updateScore();
    if(getValidMoves("pink").length===0){
      if(getValidMoves("white").length===0) return finishGame();
      setTimeout(()=>aiTurn(),250);
    }
  }

  // --- 勝敗メッセージ＋文字色反映 ---
  function finishGame(){
    gameEnded = true;
    const p = board.flat().filter(c=>"pink"===c).length;
    const w = board.flat().filter(c=>"white"===c).length;

    let msg = "";
    let color = "";
    let fontSize = "";
    let fontWeight = "bold";
    let textShadow = "";

    if(p > w){
      msg = victoryMessages[Math.floor(Math.random() * victoryMessages.length)];
      color = "#ff69b4";
      fontSize = "2rem";
      textShadow = "0 0 10px #ffb6c1, 0 0 20px #ff69b4";
    } else if(p < w){
      msg = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
      color = "#999";
      fontSize = "1.8rem";
      textShadow = "0 0 5px #bbb, 0 0 10px #888";
    } else {
      msg = drawMessages[Math.floor(Math.random() * drawMessages.length)];
      color = "#6a5acd";
      fontSize = "1.8rem";
      textShadow = "0 0 5px #c0c0ff, 0 0 10px #aaa";
    }

    if(resultPanel) {
      resultPanel.textContent = msg;
      resultPanel.style.color = color;
      resultPanel.style.fontSize = fontSize;
      resultPanel.style.fontWeight = fontWeight;
      resultPanel.style.textShadow = textShadow;
    }

    if(resultPanel2) {
      resultPanel2.textContent = msg;
      resultPanel2.style.color = color;
      resultPanel2.style.fontSize = fontSize;
      resultPanel2.style.fontWeight = fontWeight;
      resultPanel2.style.textShadow = textShadow;
    }

    updateScore();
  }

  initBoard();
});

function createSeasonEffect() {
  const effectContainer = document.getElementById("season-effect");
  if (!effectContainer) return;

  for (let i = 0; i < 40; i++) {
    const petal = document.createElement("div");
    petal.className = "effect-item spring-item";
    petal.style.left = Math.random() * 100 + "%";
    petal.style.animationDuration = 5 + Math.random() * 5 + "s";
    petal.style.opacity = 0.5 + Math.random() * 0.5;
    petal.style.width = 10 + Math.random() * 10 + "px";
    petal.style.height = 8 + Math.random() * 6 + "px";
    effectContainer.appendChild(petal);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  createSeasonEffect();
});

// ルール説明の折りたたみ機能
const ruleToggles = document.querySelectorAll(".rule-toggle");
ruleToggles.forEach(toggle => {
  toggle.addEventListener("click", () => {
    const list = toggle.nextElementSibling; // ul.rule-list
    if (!list) return;
    if (list.style.display === "block") {
      list.style.display = "none";
      toggle.textContent = "ルール説明 ▼";
    } else {
      list.style.display = "block";
      toggle.textContent = "ルール説明 ▲";
    }
  });
});
