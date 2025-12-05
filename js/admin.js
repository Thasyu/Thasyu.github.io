document.addEventListener("DOMContentLoaded", async () => {
  const contactsList = document.getElementById("contacts-list");
  const searchInput = document.getElementById("search-input");
  const refreshBtn = document.getElementById("refresh-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const usernameElement = document.getElementById("admin-username");

  let allContacts = [];

  // ユーザー名を表示
  usernameElement.textContent = "管理者";

  // お問い合わせ一覧を読み込む
  async function loadContacts() {
    try {
      contactsList.innerHTML = '<p class="loading">読み込み中...</p>';
      
      const response = await fetch("/api/contacts");
      if (!response.ok) {
        throw new Error("お問い合わせの取得に失敗しました");
      }

      allContacts = await response.json();
      displayContacts(allContacts);
    } catch (error) {
      console.error("エラー:", error);
      contactsList.innerHTML = `<p class="no-contacts">お問い合わせの読み込みに失敗しました</p>`;
    }
  }

  // お問い合わせを表示
  function displayContacts(contacts) {
    if (contacts.length === 0) {
      contactsList.innerHTML = '<p class="no-contacts">お問い合わせはまだありません</p>';
      return;
    }

    // 日付順でソート(新しい順)
    const sortedContacts = [...contacts].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    contactsList.innerHTML = sortedContacts.map(contact => {
      const date = new Date(contact.timestamp);
      const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

      return `
        <div class="contact-card">
          <div class="contact-header">
            <div class="contact-info">
              <div class="contact-name">${escapeHtml(contact.name)}</div>
              <div class="contact-email">${escapeHtml(contact.email)}</div>
            </div>
            <div class="contact-date">${formattedDate}</div>
          </div>
          <div class="contact-message">${escapeHtml(contact.message)}</div>
        </div>
      `;
    }).join('');
  }

  // HTMLエスケープ
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // 検索機能
  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredContacts = allContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchTerm) ||
      contact.email.toLowerCase().includes(searchTerm) ||
      contact.message.toLowerCase().includes(searchTerm)
    );
    displayContacts(filteredContacts);
  });

  // 更新ボタン
  refreshBtn.addEventListener("click", () => {
    searchInput.value = "";
    loadContacts();
  });

  // ログアウト
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/logout");
      window.location.href = "/login";
    } catch (error) {
      console.error("ログアウトエラー:", error);
      window.location.href = "/login";
    }
  });

  // 初回読み込み
  await loadContacts();
});
