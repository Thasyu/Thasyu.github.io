# Thasyu World

チャシューによる最高の世界へようこそ！

## 機能

- ユーザーログイン機能
- ログインボーナスシステム
- 各種ゲーム（テトリス、オセロ、2048、占い）
- マガジンセクション

## デプロイ方法（Render）

### 1. GitHubにプッシュ

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### 2. Renderでデプロイ

1. [Render](https://render.com/)にアクセスしてログイン
2. 「New +」→「Web Service」を選択
3. GitHubリポジトリを連携
4. 以下の設定を入力:
   - **Name**: thasyu-world（任意）
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. 環境変数を設定:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `任意の長いランダム文字列`

6. 「Create Web Service」をクリック

## ローカル実行

```bash
npm install
npm start
```

http://localhost:3000/login にアクセス

## デフォルトログイン情報

- Username: `Thasyu`
- Password: `0714`
