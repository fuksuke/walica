# Walica - Payment Memory Web Service

割り勘記録・共有Webサービス「Walica」のソースコードリポジトリです。

## 技術スタック
- **Frontend**: React, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite (開発用) / PostgreSQL (本番想定)

## 開発環境のセットアップ (共同開発者向け)

このリポジトリをCloneした後、以下の手順で開発環境を起動してください。

### 1. 依存関係のインストール

**Server (Backend)**
```bash
cd server
npm install
```

**Client (Frontend)**
```bash
cd client
npm install
```

### 2. アプリケーションの起動

開発サーバーを起動するには、ターミナルを2つ開き、それぞれで以下のコマンドを実行します。

**Terminal 1: Backend**
```bash
cd server
node src/index.js
```
サーバーは `http://localhost:3000` で起動し、データベースファイル (`database.sqlite`) が自動的に作成されます。

**Terminal 2: Frontend**
```bash
cd client
npm run dev
```
ブラウザで `http://localhost:5173` にアクセスするとアプリが利用できます。

## 機能
- ユーザー登録・ログイン
- グループ作成・参加（招待リンク対応）
- 支払い記録（手動入力・音声入力モック）
- 貸し借りサマリー表示
- 支払い情報の編集

## 共同開発の進め方
1. `main` ブランチから機能ごとにブランチを切って作業してください。
2. 作業完了後、`Push` してプルリクエストを作成してください。
