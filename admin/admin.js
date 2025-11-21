async function loadLogs() {
  try {
    const res = await fetch('/admin/logs');
    if (!res.ok) throw new Error('ログ取得に失敗しました');
    const text = await res.text();

    const tbody = document.getElementById('logs');
    tbody.innerHTML = '';

    const lines = text.trim().split('\n');
    lines.forEach(line => {
      const [datetime, name, email, message] = line.split(' | ');
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${datetime || ''}</td>
        <td>${name || ''}</td>
        <td>${email || ''}</td>
        <td>${message || ''}</td>
      `;
      tbody.appendChild(tr);
    });

    if (lines.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">ログがありません</td></tr>';
    }
  } catch (err) {
    document.getElementById('logs').innerHTML =
      `<tr><td colspan="4">エラー: ${err.message}</td></tr>`;
    console.error(err);
  }
}

loadLogs();
setInterval(loadLogs, 30000);
