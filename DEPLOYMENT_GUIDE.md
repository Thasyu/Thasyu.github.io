# NKC-WBT 学習サイト - デプロイガイド

## GitHubへのアップロード手順

### 1. Gitリポジトリの初期化

ターミナルでプロジェクトディレクトリに移動し、以下のコマンドを実行します：

```powershell
# Gitリポジトリを初期化
git init

# すべてのファイルをステージング
git add .

# 初回コミット
git commit -m "Initial commit: NKC-WBT学習サイト"
```

### 2. GitHubリポジトリの作成

1. [GitHub](https://github.com) にログイン
2. 右上の「+」アイコンをクリック → "New repository" を選択
3. リポジトリ設定：
   - **Repository name**: `nkc-wbt-study-site`（または任意の名前）
   - **Description**: `iPad Pro向け学習サイト - IT資格試験対策`
   - **Public** または **Private** を選択（Renderの無料プランはPublicリポジトリが必要）
   - **README.md は追加しない**（既に存在するため）
4. "Create repository" をクリック

### 3. ローカルリポジトリとGitHubを接続

GitHubで作成したリポジトリのページに表示されるコマンドを実行：

```powershell
# リモートリポジトリを追加（YOUR_USERNAMEは自分のGitHubユーザー名に置き換え）
git remote add origin https://github.com/YOUR_USERNAME/nkc-wbt-study-site.git

# メインブランチ名を設定
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

## Renderへのデプロイ手順

### 1. Renderアカウントの準備

1. [Render](https://render.com) にアクセス
2. GitHubアカウントでサインアップ/ログイン
3. GitHubとの連携を許可

### 2. 新しい静的サイトの作成

1. Renderダッシュボードで **"New +"** ボタンをクリック
2. **"Static Site"** を選択
3. GitHubリポジトリ一覧から `nkc-wbt-study-site` を選択
4. 以下の設定を入力：

   **基本設定:**
   - **Name**: `nkc-wbt-study`（または任意の名前）
   - **Branch**: `main`
   - **Root Directory**: 空欄（ルートディレクトリを使用）

   **ビルド設定:**
   - **Build Command**: `echo "No build required"`
   - **Publish Directory**: `.`

5. **"Create Static Site"** をクリック

### 3. 自動デプロイの確認

- `render.yaml` が含まれているため、設定は自動的に適用されます
- 初回デプロイには数分かかります
- デプロイが完了すると、`https://nkc-wbt-study.onrender.com` のようなURLが発行されます

### 4. カスタムドメインの設定（オプション）

1. Renderダッシュボードで作成したサイトを選択
2. **"Settings"** → **"Custom Domains"** に移動
3. 独自ドメインを追加（所有している場合）

## 更新方法

ファイルを更新した後、以下のコマンドでGitHubにプッシュすると、Renderで自動的に再デプロイされます：

```powershell
# 変更をステージング
git add .

# コミット（メッセージは変更内容に応じて記述）
git commit -m "コンテンツ更新: 新しい問題を追加"

# GitHubにプッシュ
git push origin main
```

## iPad Proでの確認

1. Safari または Chrome で発行されたURLにアクセス
2. ホーム画面に追加（PWA風の体験が可能）：
   - Safari: 共有ボタン → "ホーム画面に追加"
3. フルスクリーンで快適に学習できます

## トラブルシューティング

### デプロイが失敗する場合

1. Renderのログを確認
2. `render.yaml` の設定を確認
3. すべてのファイルがGitHubにプッシュされているか確認

### ファイルが表示されない場合

1. ブラウザのキャッシュをクリア
2. Renderで強制再デプロイ: "Manual Deploy" → "Clear build cache & deploy"

### 相対パスのエラー

- すべてのリンクが相対パス（`./` または `../`）になっているか確認
- 現在の構成では問題ありません

## セキュリティとプライバシー

- **Private リポジトリ**: Renderの有料プランが必要
- **Public リポジトリ**: 無料プランで利用可能（問題集の内容が公開されます）
- **認証が必要な場合**: Render の Authentication 機能（有料）または別のサービスを検討

## サポート

問題が発生した場合：
- Renderドキュメント: https://render.com/docs/static-sites
- GitHubヘルプ: https://docs.github.com/

---

**作成日**: 2026年2月4日  
**対象**: 学校法人 電波学園 NKC-WBT学習サイト
