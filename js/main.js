// スクロールアニメーション
let lastScrollY = window.scrollY;

function onScrollAnimate() {
  const elements = Array.from(document.querySelectorAll('.fade-in-up'));
  const windowBottom = window.innerHeight + window.scrollY;

  const scrollingDown = window.scrollY > lastScrollY;
  lastScrollY = window.scrollY;

  if (!scrollingDown) {
    elements.reverse();
  }

  elements.forEach(el => {
    if (windowBottom > el.offsetTop + 100) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

document.addEventListener('scroll', onScrollAnimate);
window.addEventListener('load', onScrollAnimate);

// お問い合わせフォーム送信処理
document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");
  const contactStatus = document.getElementById("contact-status");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const message = document.getElementById("contact-message").value.trim();

      if (!name || !email || !message) {
        contactStatus.textContent = "すべての項目を入力してください";
        contactStatus.style.color = "#e74c3c";
        return;
      }

      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, message }),
        });

        const result = await response.json();

        if (response.ok) {
          contactStatus.textContent = "お問い合わせを送信しました。ありがとうございます!";
          contactStatus.style.color = "#27ae60";
          contactForm.reset();
        } else {
          contactStatus.textContent = result.error || "送信に失敗しました";
          contactStatus.style.color = "#e74c3c";
        }
      } catch (error) {
        console.error("送信エラー:", error);
        contactStatus.textContent = "送信中にエラーが発生しました";
        contactStatus.style.color = "#e74c3c";
      }
    });
  }
});
