// login.js
document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const errorMessage = document.getElementById("error-message");

  // サーバーから ?error=1 が送られてきた場合に表示
  if (params.has("error")) {
    errorMessage.textContent = "ユーザー名またはパスワードが違います。";
    errorMessage.style.display = "block";
  }
});
