// シャボン玉生成関数
function createBubble() {
  const bubble = document.createElement("div");
  bubble.classList.add("bubble");

  // ランダムサイズ
  const size = 20 + Math.random() * 70;
  bubble.style.width = size + "px";
  bubble.style.height = size + "px";

  // 偏りなく画面全体に配置（サイズを考慮して端にくっつかないように調整）
  const maxLeft = window.innerWidth - size;
  bubble.style.left = `${Math.random() * maxLeft}px`;

  // 初期位置は画面下から
  bubble.style.bottom = "0px";

  document.body.appendChild(bubble);

  // 浮き上がるアニメーション
  const duration = 8000 + Math.random() * 8000; // 8〜16秒
  bubble.animate(
    [
      { transform: `translateY(0)` },
      { transform: `translateY(-${window.innerHeight + 100}px)` }
    ],
    {
      duration: duration,
      easing: "ease-out"
    }
  );

  // アニメーション終了後に削除
  setTimeout(() => bubble.remove(), duration);
}

// ページ読み込み時にすぐ生成開始
document.addEventListener("DOMContentLoaded", () => {
  // 初期に数個生成
  for (let i = 0; i < 5; i++) {
    createBubble();
  }

  // 定期的に生成
  setInterval(createBubble, 1500);
});
