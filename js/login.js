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
      // サーバー経由でログイン処理を行う
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const response = await fetch("/login", {
        method: "POST",
        body: formData,
      });

      // サーバーがリダイレクトする場合、自動的にリダイレクトされる
      if (response.redirected) {
        window.location.href = response.url;
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
