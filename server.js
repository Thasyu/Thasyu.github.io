// ====================== server.js ======================
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

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ====================== ミドルウェア ======================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60, httpOnly: true },
  })
);

const csrfProtection = csurf({ cookie: false });

// ====================== 静的ファイル ======================
app.use(express.static(path.join(__dirname, "public")));
app.use("/game", express.static(path.join(__dirname, "game")));
app.use("/diagnosis", express.static(path.join(__dirname, "diagnosis")));
app.use("/inquiry", express.static(path.join(__dirname, "inquiry")));
app.use("/admin", express.static(path.join(__dirname, "admin")));

// ====================== Nodemailer ======================
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
  let changed = false;
  for (let user of users) {
    if (!user.password.startsWith("$2b$")) {
      user.password = bcrypt.hashSync(user.password, 10);
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
app.get("/login", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "login.html"))
);

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const usersFile = path.join(__dirname, "users.json");
  const users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, "utf8")) : [];
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

// ====================== 新規登録 ======================
app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "register.html"))
);

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).send("ユーザー名とパスワードは必須です");

  const usersFile = path.join(__dirname, "users.json");
  let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, "utf8")) : [];

  if (users.some((u) => u.username === username)) return res.status(400).send("そのユーザー名は既に存在します");

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword, tickets: null });
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  console.log(`✅ 新規ユーザー登録: ${username}`);

  res.redirect("/registerthanks");
});

app.get("/registerthanks", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "registerthanks.html"))
);

// ====================== ページアクセス ======================
app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.sendFile(path.join(__dirname, "public", "index.html"));
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
// ログインユーザー用 CSRF
app.get("/inquiry", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/login");

  let html = fs.readFileSync(path.join(__dirname, "inquiry", "inquiry.html"), "utf8");
  html = html.replace("{{csrfToken}}", req.csrfToken());
  res.send(html);
});

app.post("/inquiry", csrfProtection, (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  handleInquiry(req.body);
  res.sendFile(path.join(__dirname, "inquiry", "thanks.html"));
});

// 外部用トークンフォーム（ログイン不要）
app.post("/inquiry/external", (req, res) => {
  const token = req.body.token;
  if (token !== process.env.INQUIRY_TOKEN) return res.status(403).send("無効なトークンです");
  handleInquiry(req.body);
  res.sendFile(path.join(__dirname, "inquiry", "thanks.html"));
});

// 共通処理
function handleInquiry({ name, email, message }) {
  const safeName = sanitizeHtml(name);
  const safeEmail = sanitizeHtml(email);
  const safeMessage = sanitizeHtml(message);

  if (!safeName || !safeEmail || !safeMessage) throw new Error("必須項目が未入力です");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(safeEmail)) throw new Error("メールアドレス形式が不正です");

  const log = `[${new Date().toISOString()}] ${safeName} | ${safeEmail} | ${safeMessage}\n`;
  fs.appendFileSync(path.join(__dirname, "inquiries.txt"), log, "utf8");

  transporter.sendMail({
    from: `"Thasyu World" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER,
    subject: "新しいお問い合わせ",
    text: `名前: ${safeName}\nメール: ${safeEmail}\n内容:\n${safeMessage}`,
  }, (err, info) => {
    if (err) console.error("メール送信エラー:", err);
    else console.log("メール送信成功:", info.response);
  });
}

// ====================== 管理画面 ======================
app.get("/admin", (req, res) => {
  if (!req.session.user || req.session.user.username !== "admin") return res.status(403).send("アクセス権限がありません");
  res.sendFile(path.join(__dirname, "admin", "admin.html"));
});

app.get("/admin/logs", (req, res) => {
  if (!req.session.user || req.session.user.username !== "admin") return res.status(403).send("アクセス権限がありません");
  const logs = fs.readFileSync(path.join(__dirname, "inquiries.txt"), "utf8");
  res.send(logs);
});

// ====================== サーバー起動 ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
