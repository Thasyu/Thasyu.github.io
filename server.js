// ====================== server.js ======================
// ES Modules構文に対応したExpressサーバー設定
import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirnameをESMで使えるように設定
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ====================== ミドルウェア設定 ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 1000 * 60 * 60, // 1時間
      secure: process.env.NODE_ENV === "production", // 本番環境ではHTTPSを使用
      sameSite: "lax"
    },
  })
);

// ====================== 静的ファイル ======================
// 各種フォルダを公開
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));

// 🎮 gameフォルダ内のHTML/CSS/JSも公開
app.use("/game", express.static(path.join(__dirname, "game")));

// ====================== ユーティリティ関数 ======================

// adminユーザーかどうかをチェック
function isAdmin(username) {
  return username === "admin";
}

// ====================== ページルート ======================

// 🔹 ログインページ
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

// 🔹 ログイン処理
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    req.session.user = { username: user.username, isAdmin: isAdmin(user.username) };
    
    // adminユーザーの場合は管理者ページへ、それ以外はindex.htmlへ
    if (isAdmin(user.username)) {
      res.redirect("/admin");
    } else {
      res.redirect("/");
    }
  } else {
    res.redirect("/login?error=1"); // ❌ エラー表示
  }
});

// 🔹 トップページ(ログイン必須)
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  
  // adminユーザーは管理者ページへリダイレクト
  if (req.session.user.isAdmin) {
    return res.redirect("/admin");
  }
  
  res.sendFile(path.join(__dirname, "index.html"));
});

// 🔹 管理者ページ(admin専用)
app.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  
  // adminユーザーでない場合は通常ページへ
  if (!req.session.user.isAdmin) {
    return res.redirect("/");
  }
  
  res.sendFile(path.join(__dirname, "admin.html"));
});

// 🎮 ゲームページ
app.get("/game", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "game", "game.html"));
});

// ====================== API ======================

// 🎁 ログインボーナスAPI
app.get("/api/bonus", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ showBonus: false, message: "未ログインです" });

  const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
  const user = users.find((u) => u.username === req.session.user.username);

  if (!user) {
    return res.status(404).json({
      showBonus: false,
      message: "ユーザーが見つかりません",
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  // ✅ 受け取り済みの場合
  if (user.lastBonus === today) {
    return res.json({
      showBonus: false,
      message: "今日のボーナスは受け取り済みです",
      tickets: user.tickets,
    });
  }

  // ✅ 初回受け取り
  user.lastBonus = today;
  user.tickets += 1;
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  res.json({
    showBonus: true,
    message: "今日のログインボーナス！",
    tickets: user.tickets,
  });
});

// 🎯 チケットを使って占うAPI
app.post("/api/use-ticket", (req, res) => {
  if (!req.session.user)
    return res.status(401).json({ error: "ログインが必要です。" });

  const users = JSON.parse(fs.readFileSync("users.json", "utf8"));
  const user = users.find((u) => u.username === req.session.user.username);

  if (!user || user.tickets <= 0) {
    return res.json({ error: "チケットが足りません。" });
  }

  // チケットを1枚消費
  user.tickets -= 1;
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));

  // ランダム占い
  const fortunes = ["大吉", "中吉", "小吉", "吉", "末吉", "凶"];
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];

  res.json({ fortune });
});

// ====================== 占いページルート ======================
app.get("/game/fortune", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "game", "fortune.html"));
});

// ====================== お問い合わせAPI ======================

// 📧 お問い合わせ送信API
app.post("/api/contact", (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "すべての項目を入力してください" });
  }

  try {
    // contacts.jsonからデータを読み込む
    let contacts = [];
    if (fs.existsSync("contacts.json")) {
      contacts = JSON.parse(fs.readFileSync("contacts.json", "utf8"));
    }

    // 新しいお問い合わせを追加
    const newContact = {
      id: Date.now(),
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
    };

    contacts.push(newContact);

    // contacts.jsonに保存
    fs.writeFileSync("contacts.json", JSON.stringify(contacts, null, 2));

    res.json({ success: true, message: "お問い合わせを受け付けました" });
  } catch (error) {
    console.error("お問い合わせ保存エラー:", error);
    res.status(500).json({ error: "お問い合わせの保存に失敗しました" });
  }
});

// 📋 お問い合わせ一覧取得API(admin専用)
app.get("/api/contacts", (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "ログインが必要です" });
  }

  if (!req.session.user.isAdmin) {
    return res.status(403).json({ error: "管理者権限が必要です" });
  }

  try {
    let contacts = [];
    if (fs.existsSync("contacts.json")) {
      contacts = JSON.parse(fs.readFileSync("contacts.json", "utf8"));
    }

    res.json(contacts);
  } catch (error) {
    console.error("お問い合わせ取得エラー:", error);
    res.status(500).json({ error: "お問い合わせの取得に失敗しました" });
  }
});

// ====================== ログアウト ======================
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("ログアウトエラー:", err);
    res.clearCookie("connect.sid");
    res.setHeader("Cache-Control", "no-store");
    res.redirect("/login");
  });
});

// ====================== サーバー起動 ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ サーバー起動中: http://localhost:${PORT}/login`)
);
