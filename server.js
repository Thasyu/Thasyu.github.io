// ====================== server.js ======================
// ES Modules構文対応 Express サーバー
import express from "express";
import session from "express-session";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csurf from "csurf";
import sanitizeHtml from "sanitize-html";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

// ====================== dotenv 設定 ======================
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ====================== ミドルウェア ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true }, // 1時間
  })
);

const csrfProtection = csurf({ cookie: false });

// ====================== 静的ファイル ======================
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/diagnosis", express.static(path.join(__dirname, "diagnosis")));
app.use("/inquiry", express.static(path.join(__dirname, "inquiry")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ====================== Nodemailer 設定 ======================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// ====================== users.json パスワードハッシュ化 ======================
function hashUsersPasswords() {
  const usersFile = path.join(__dirname, "users.json");
  if (!fs.existsSync(usersFile)) return;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  const saltRounds = 10;
  let changed = false;

  for (let user of users) {
    if (!user.password.startsWith("$2b$")) {
      user.password = bcrypt.hashSync(user.password, saltRounds);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    console.log("✅ users.json のパスワードをハッシュ化しました");
  }
}
hashUsersPasswords();

// ====================== ログイン関連 ======================
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usersFile = path.join(__dirname, "users.json");
  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  const user = users.find((u) => u.username === username);

  if (!user) return res.redirect("/login?error=1");

  const match = await bcrypt.compare(password, user.password);

  if (match) {
    req.session.user = { username: user.username };
    res.redirect("/");
  } else {
    res.redirect("/login?error=1");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("ログアウトエラー:", err);
    res.clearCookie("connect.sid");
    res.setHeader("Cache-Control", "no-store");
    res.redirect("/login");
  });
});

// ====================== 新規ユーザー登録 ======================
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "register.html"));
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("ユーザー名とパスワードは必須です");
  }

  const usersFile = path.join(__dirname, "users.json");
  let users = [];
  if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile, "utf8"));
  }

  if (users.some(u => u.username === username)) {
    return res.status(400).send("そのユーザー名は既に存在します");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, tickets: null });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log(`✅ 新規ユーザー登録: ${username}`);

  res.send(`
    <h2>登録が完了しました！</h2>
    <p>ユーザー名: ${username}</p>
    <a href="/login">ログインページへ</a>
  `);
});

// ====================== ページアクセス ======================
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/game", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "game", "game.html"));
});

app.get("/game/fortune", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "game", "game.html"));
});

app.get("/diagnosis/diagnosis.html", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "diagnosis", "diagnosis.html"));
});

// ====================== お問い合わせ ======================
app.get("/inquiry", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  let html = fs.readFileSync(path.join(__dirname, "inquiry", "inquiry.html"), "utf8");
  html = html.replace("{{csrfToken}}", req.csrfToken());
  res.send(html);
});

app.post("/inquiry", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  const { name, email, message } = req.body;

  const safeName = sanitizeHtml(name);
  const safeEmail = sanitizeHtml(email);
  const safeMessage = sanitizeHtml(message);

  if (!safeName || !safeEmail || !safeMessage) {
    return res.status(400).send("必須項目が未入力です");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) {
    return res.status(400).send("メールアドレスの形式が正しくありません");
  }

  const log = `[${new Date().toISOString()}] ${safeName} | ${safeEmail} | ${safeMessage}\n`;
  fs.appendFileSync(path.join(__dirname, "inquiries.txt"), log, "utf8");

  const mailOptions = {
    from: `"Thasyu World" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: "新しいお問い合わせ",
    text: `名前: ${safeName}\nメール: ${safeEmail}\n内容:\n${safeMessage}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error("メール送信エラー:", err);
    else console.log("メール送信成功:", info.response);
  });

  res.send(`
    <h2>お問い合わせありがとうございました！</h2>
    <p>名前: ${safeName}</p>
    <p>メール: ${safeEmail}</p>
    <p>内容: ${safeMessage}</p>
    <a href="/">トップページに戻る</a>
  `);
});

// ====================== 管理画面 ======================
app.get("/admin", (req, res) => {
  if (!req.session.user || req.session.user.username !== "admin") {
    return res.status(403).send("アクセス権限がありません");
  }
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.get("/admin/logs", (req, res) => {
  if (!req.session.user || req.session.user.username !== "admin") {
    return res.status(403).send("アクセス権限がありません");
  }
  const logs = fs.readFileSync(path.join(__dirname, "inquiries.txt"), "utf8");
  res.send(logs);
});

// ====================== サーバー起動 ======================
app.listen(3000, () =>
  console.log("✅ サーバー起動中: http://localhost:3000/login")
);
