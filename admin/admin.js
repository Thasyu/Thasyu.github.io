// ====================== admin.js ======================

// 管理者用お問い合わせログ読み込み
async function loadLogs() {
  const tbody = document.getElementById('logs');
  tbody.innerHTML = '<tr><td colspan="4">読み込み中...</td></tr>';

  try {
    // SupabaseからJSONを取得
    const res = await fetch('/admin/logs');
    if (!res.ok) throw new Error('ログ取得に失敗しました');

    const data = await res.json();

    tbody.innerHTML = '';

    if (!data || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">ログがありません</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');

      // 日時をローカルタイムに整形
      const datetime = row.created_at ? new Date(row.created_at).toLocaleString() : '';

      tr.innerHTML = `
        <td>${datetime}</td>
        <td>${row.name || ''}</td>
        <td>${row.email || ''}</td>
        <td>${row.message || ''}</td>
      `;
      tbody.appendChild(tr);
    });

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">エラー: ${err.message}</td></tr>`;
    console.error(err);
  }
}

// 初回読み込み
loadLogs();

// 30秒ごとに更新
setInterval(loadLogs, 30000);
