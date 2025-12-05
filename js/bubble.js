document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".bubble-container");

  const bubbleCount = 15; // シャボン玉の数
  for (let i = 0; i < bubbleCount; i++) {
    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    // ランダムな大きさ（20〜60px）
    const size = Math.random() * 40 + 20;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;

    // ランダムな位置とアニメーション時間・遅延
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.animationDuration = `${8 + Math.random() * 6}s`;
    bubble.style.animationDelay = `${Math.random() * 4}s`;

    container.appendChild(bubble);
  }
});
