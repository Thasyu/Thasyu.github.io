// ===============================
// ログインページ用処理
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const errorMessage = document.getElementById("error-message");

  // ❌ ログインエラー表示
  if (params.has("error")) {
    errorMessage.textContent = "ユーザー名またはパスワードが違います。";
    errorMessage.style.display = "block";
  }
});
