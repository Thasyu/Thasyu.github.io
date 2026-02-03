# NKC-WBT 学習サイト

iPad Pro（13インチ）向けに最適化された学習システムです。

## 概要

このシステムは、各種IT資格試験の学習をサポートする静的Webアプリケーションです。
オフライン環境でも利用でき、タブレット（特にiPad Pro 13インチ）での学習に最適化されています。

## 提供コンテンツ

### Oracle認定試験
- **Oracle Master Bronze DBA** (1Z0-085)
  - Oracle Database Fundamentals 完全詳解＋精選問題集
  - オラクルマスター教科書 Bronze DBA
- **Java プログラマ Bronze SE** (1Z0-818)
  - スピードマスター問題集

### Linux認定試験
- **LPIC-1** (010-160)
  - さわって学ぶLinux入門テキスト（選択問題のみ）
- **LinuC レベル1 Ver10.0** (101試験)
  - スピードマスター問題集

### その他
- **HTML5プロフェッショナル認定試験 レベル1**
- **DX検定** - 模擬問題集

## 技術スタック

- HTML5 (XHTML 1.0 Strict)
- CSS3
- JavaScript
- jQuery 1.7.2

## ローカル環境での使用方法

1. リポジトリをクローンまたはダウンロード
2. `index.html` をブラウザで開く
3. 学習したい試験を選択

## デプロイ方法

### Renderへのデプロイ

このサイトは静的サイトとしてRenderにデプロイできます。

1. GitHubにリポジトリをプッシュ
2. [Render](https://render.com) にログイン
3. "New Static Site" を選択
4. GitHubリポジトリを接続
5. 以下の設定を使用：
   - **Build Command**: `echo "No build required"`
   - **Publish Directory**: `.`（ルートディレクトリ）

`render.yaml` ファイルが含まれているため、自動的に設定が適用されます。

## ブラウザ対応

- Safari (iPad Pro推奨)
- Chrome
- Firefox
- Edge

## ライセンス

学校法人 電波学園

## 更新履歴

- 2026-01-23: Javaプログラマ問題集更新
- 2026-01-14: DX検定模擬問題集更新
- 2024-07-24: Oracle Master Bronze問題集更新
