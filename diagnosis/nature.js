const cloudCanvas = document.getElementById('clouds');
const cloudCtx = cloudCanvas.getContext('2d');
const waterCanvas = document.getElementById('water');
const waterCtx = waterCanvas.getContext('2d');

function resizeCanvas() {
  cloudCanvas.width = waterCanvas.width = cloudCanvas.offsetWidth;
  cloudCanvas.height = waterCanvas.height = cloudCanvas.offsetHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// 🌸 雲オブジェクト（ピンク系）
class Cloud {
  constructor() {
    this.x = Math.random() * cloudCanvas.width;
    this.y = Math.random() * cloudCanvas.height * 0.5;
    this.size = 50 + Math.random() * 80;
    this.speed = 0.2 + Math.random() * 0.5;
    this.opacity = 0.2 + Math.random() * 0.3;
    this.opacityChange = 0.002 + Math.random() * 0.003;
  }
  draw() {
    cloudCtx.fillStyle = `rgba(255,182,193,${this.opacity})`; // ピンク系
    cloudCtx.beginPath();
    cloudCtx.ellipse(this.x, this.y, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
    cloudCtx.fill();
    // 透明度の微妙な変化
    this.opacity += this.opacityChange;
    if(this.opacity > 0.5 || this.opacity < 0.2) this.opacityChange *= -1;
    // X軸移動
    this.x += this.speed;
    if(this.x - this.size > cloudCanvas.width) this.x = -this.size;
  }
}

// 🌊 水面オブジェクト（ピンク・水色系）
class Wave {
  constructor(y, amplitude, wavelength, speed, opacity, color) {
    this.y = y;
    this.amplitude = amplitude;
    this.wavelength = wavelength;
    this.speed = speed;
    this.opacity = opacity;
    this.phase = 0;
    this.color = color; // 波の色
  }
  draw(time) {
    waterCtx.beginPath();
    for(let x = 0; x < waterCanvas.width; x++) {
      let y = this.y + this.amplitude * Math.sin((x / this.wavelength) + this.phase);
      waterCtx.lineTo(x, y);
    }
    waterCtx.strokeStyle = `rgba(${this.color},${this.opacity})`;
    waterCtx.lineWidth = 2;
    waterCtx.stroke();
    // 波の揺れと透明度の微変化
    this.phase += this.speed;
    this.opacity += (Math.random() - 0.5) * 0.005;
    if(this.opacity > 0.5) this.opacity = 0.5;
    if(this.opacity < 0.2) this.opacity = 0.2;
  }
}

// 雲・波の初期化
const clouds = Array.from({length: 8}, () => new Cloud());
const waves = [
  new Wave(cloudCanvas.height * 0.8, 10, 200, 0.02, 0.3, "255,182,193"), // 薄ピンク
  new Wave(cloudCanvas.height * 0.85, 15, 150, 0.03, 0.2, "255,105,180"), // 濃いピンク
  new Wave(cloudCanvas.height * 0.9, 12, 180, 0.025, 0.25, "173,216,230"), // 淡い水色
];

// アニメーション
function animate() {
  cloudCtx.clearRect(0, 0, cloudCanvas.width, cloudCanvas.height);
  waterCtx.clearRect(0, 0, waterCanvas.width, waterCanvas.height);

  clouds.forEach(c => c.draw());
  waves.forEach(w => w.draw());

  requestAnimationFrame(animate);
}

animate();

/* ==============================
   🌌 流れ星エフェクト（完全版）
   - 角度・出現位置ランダム（右/左/上）
   - 群れ発生あり（2〜5本）
   - キラキラ残光付き
   - ピンク系幻想スタイル
   ============================== */

(function() {
  const container = document.getElementById('shooting-stars');
  if (!container) return;

  const stars = [];
  const sparks = [];
  const w = () => container.clientWidth;
  const h = () => container.clientHeight;

  const spawnIntervalMs = 900; // 平均 0.9秒ごと

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  // 🌠 流れ星を作成
  function createStar() {
    const el = document.createElement('div');
    el.className = 'shooting-star';

    const core = document.createElement('div');
    core.className = 'core';
    el.appendChild(core);

    const tail = document.createElement('div');
    tail.className = 'tail';
    el.appendChild(tail);

    // === 開始位置（画面上・右・左からランダム） ===
    const edges = ['top', 'right', 'left'];
    const fromEdge = edges[Math.floor(Math.random() * edges.length)];
    let x, y;

    if (fromEdge === 'top') {
      x = rand(0.05 * w(), 0.95 * w());
      y = rand(-0.05 * h(), 0.05 * h());
    } else if (fromEdge === 'right') {
      x = rand(0.95 * w(), 1.05 * w());
      y = rand(0.05 * h(), 0.8 * h());
    } else {
      x = rand(-0.05 * w(), 0.05 * w());
      y = rand(0.05 * h(), 0.8 * h());
    }

    // === 角度設定（出発辺ごとに自然な方向） ===
    let angleDeg;
    if (fromEdge === 'top') {
      angleDeg = rand(220, 320); // 上→斜め下
    } else if (fromEdge === 'right') {
      angleDeg = rand(180, 260); // 右→左
    } else {
      angleDeg = rand(300, 360); // 左→右
    }
    const angleRad = angleDeg * Math.PI / 180;

    // === スピードと尾 ===
    const speed = rand(3.0, 8.0);
    const tailLen = Math.floor(rand(120, 250) * (speed / 5));

    el.style.transform = `translate(${x}px, ${y}px) rotate(${angleDeg}deg)`;
    tail.style.width = `${tailLen}px`;
    tail.style.marginLeft = `${-tailLen}px`;

    const life = rand(700, 1200);
    const birth = performance.now();

    const starObj = {
      el, core, tail,
      x, y,
      vx: Math.cos(angleRad) * speed,
      vy: Math.sin(angleRad) * speed,
      birth, life, angleDeg
    };
    container.appendChild(el);
    stars.push(starObj);
  }

  // ✨ 残光スパーク生成（キラキラ光）
  function emitSparks(x, y) {
    const count = randInt(6, 14);
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'spark';
      const size = rand(3, 9);
      s.style.width = `${size}px`;
      s.style.height = `${size}px`;
      s.style.left = `${x - size / 2}px`;
      s.style.top = `${y - size / 2}px`;
      s.style.background = `radial-gradient(circle, rgba(255,200,255,1) 0%, rgba(255,150,255,0) 70%)`;
      s.style.opacity = '1';
      container.appendChild(s);

      const angle = rand(-Math.PI / 3, Math.PI / 3);
      const speed = rand(0.5, 2.4);
      const life = rand(400, 1200);
      const birth = performance.now();
      sparks.push({ el: s, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life, birth });
    }
  }

  // 🎞 メインループ
  let lastTs = performance.now();
  function loop(ts) {
    const dt = ts - lastTs;
    lastTs = ts;

    // 流れ星更新
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      s.el.style.transform = `translate(${s.x}px, ${s.y}px) rotate(${s.angleDeg}deg)`;

      const age = ts - s.birth;
      const lifeRatio = age / s.life;
      s.el.style.opacity = `${Math.max(0, 1 - lifeRatio * 1.1)}`;

      const offScreen = (s.x < -300 || s.x > w() + 300 || s.y < -300 || s.y > h() + 300);
      if (age > s.life || offScreen) {
        const sparkX = s.x + (s.vx * 3);
        const sparkY = s.y + (s.vy * 3);
        emitSparks(sparkX, sparkY);
        try { container.removeChild(s.el); } catch {}
        stars.splice(i, 1);
      }
    }

    // スパーク更新
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      const age = ts - p.birth;
      if (age > p.life) {
        try { container.removeChild(p.el); } catch {}
        sparks.splice(i, 1);
        continue;
      }
      p.x += p.vx;
      p.y += p.vy;
      const r = age / p.life;
      p.el.style.opacity = `${Math.max(0, 1 - r)}`;
      const scale = 1 - r * 0.5;
      p.el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${scale})`;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // ☄️ スポーンループ
  (function spawnLoop() {
    const toSpawn = Math.random() < 0.25 ? randInt(3, 6) : randInt(1, 3);
    for (let i = 0; i < toSpawn; i++) {
      setTimeout(createStar, rand(0, 220));
    }
    const next = spawnIntervalMs * rand(0.6, 1.8);
    setTimeout(spawnLoop, next);
  })();

})();
