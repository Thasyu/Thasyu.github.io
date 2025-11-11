document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!username || !password) {
      errorMessage.textContent = "ユーザー名とパスワードを入力してください";
      errorMessage.style.display = "block";
      return;
    }

    try {
      // users.json を読み込む
      const res = await fetch("users.json");
      const users = await res.json();

      // ユーザー認証
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        // 認証成功 → index.html へ遷移
        window.location.href = "index.html";
      } else {
        errorMessage.textContent = "ユーザー名またはパスワードが違います";
        errorMessage.style.display = "block";
      }

    } catch (err) {
      console.error(err);
      errorMessage.textContent = "ログインに失敗しました。";
      errorMessage.style.display = "block";
    }
  });
});
