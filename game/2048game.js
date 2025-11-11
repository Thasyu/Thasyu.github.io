document.addEventListener("DOMContentLoaded", () => {
  const loadingScreen = document.getElementById("loading-screen");

  // 🌸 ページロード後にフェードアウト
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => (loadingScreen.style.display = "none"), 800);
  }, 1200); // 1.2秒後に消える

  // ===================== ゲーム本体 =====================
  const gridContainer = document.querySelector(".grid-container");
  const scoreDisplay = document.getElementById("score");
  const restartButton = document.getElementById("restart");

  let grid = Array(4)
    .fill()
    .map(() => Array(4).fill(0));
  let score = 0;

  // ===================== タイル追加 =====================
  function addRandomTile() {
    let empty = [];
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) empty.push({ i, j });
      }
    }
    if (empty.length === 0) return;
    let { i, j } = empty[Math.floor(Math.random() * empty.length)];
    grid[i][j] = Math.random() < 0.9 ? 2 : 4;
    drawGrid();
    const tiles = gridContainer.querySelectorAll(".tile");
    const lastTile = tiles[tiles.length - 1];
    lastTile.classList.add("new-tile");
  }

  // ===================== 描画 =====================
  function drawGrid() {
    gridContainer.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        let tile = document.createElement("div");
        tile.classList.add("tile");
        if (grid[i][j] !== 0) {
          tile.classList.add(`tile-${grid[i][j]}`);
          tile.textContent = grid[i][j];
        }
        gridContainer.appendChild(tile);
      }
    }
    scoreDisplay.textContent = score;
  }

  // ===================== 動き =====================
  function combineRow(row) {
    for (let i = 0; i < 3; i++) {
      if (row[i] !== 0 && row[i] === row[i + 1]) {
        row[i] *= 2;
        score += row[i];
        row[i + 1] = 0;
      }
    }
    return row.filter((v) => v !== 0).concat(Array(4 - row.filter((v) => v !== 0).length).fill(0));
  }

  function moveLeft() {
    let moved = false;
    for (let i = 0; i < 4; i++) {
      let original = [...grid[i]];
      grid[i] = combineRow(grid[i]);
      if (!moved && grid[i].toString() !== original.toString()) moved = true;
    }
    return moved;
  }

  function rotateGrid() {
    let newGrid = Array(4)
      .fill()
      .map(() => Array(4).fill(0));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        newGrid[i][j] = grid[j][3 - i];
      }
    }
    grid = newGrid;
  }

  function move(direction) {
    for (let i = 0; i < direction; i++) rotateGrid();
    let moved = moveLeft();
    for (let i = 0; i < (4 - direction) % 4; i++) rotateGrid();
    if (moved) addRandomTile();
    drawGrid();
    if (checkGameOver()) alert("💖 Game Over 💖");
  }

  function checkGameOver() {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (grid[i][j] === 0) return false;
        if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
        if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
      }
    }
    return true;
  }

  // ===================== キー操作 =====================
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        move(0);
        break;
      case "ArrowUp":
        move(1);
        break;
      case "ArrowRight":
        move(2);
        break;
      case "ArrowDown":
        move(3);
        break;
    }
  });

  // ===================== リスタート =====================
  restartButton.addEventListener("click", () => {
    grid = Array(4)
      .fill()
      .map(() => Array(4).fill(0));
    score = 0;
    addRandomTile();
    addRandomTile();
    drawGrid();
  });

  // ===================== 初期タイル =====================
  addRandomTile();
  addRandomTile();
  drawGrid();

  // ===================== キラキラ背景 =====================
  const canvas = document.getElementById("sparkleCanvas");
  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = Array.from({ length: 100 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedX: (Math.random() - 0.5) * 0.5,
    speedY: (Math.random() - 0.5) * 0.5,
    alpha: Math.random(),
  }));

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
      ctx.fill();
      p.x += p.speedX;
      p.y += p.speedY;
      if (p.x > canvas.width) p.x = 0;
      if (p.x < 0) p.x = canvas.width;
      if (p.y > canvas.height) p.y = 0;
      if (p.y < 0) p.y = canvas.height;
    });
    requestAnimationFrame(animate);
  }
  animate();
});
