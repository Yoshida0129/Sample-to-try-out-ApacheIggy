# 🚀 クイックスタートガイド

このガイドに従って、5分でApache Iggyのサンプルアプリケーションを起動できます。

## ⚡ 3ステップで起動

### 1️⃣ 依存関係のインストール

```bash
npm install
```

### 2️⃣ Apache Iggyサーバーの起動

```bash
docker compose up -d
```

サーバーが起動するまで約10-30秒待ちます。以下のコマンドで状態を確認：

```bash
docker compose ps
```

`iggy-server` が `healthy` になったら準備完了です。

### 3️⃣ Next.jsアプリケーションの起動

```bash
npm run dev
```

ブラウザで **http://localhost:3001** を開きます。

## 🎉 使ってみよう

1. 画面上部の入力欄にメッセージを入力（例: "Hello, Iggy!"）
2. 「Send」ボタンをクリック
3. メッセージがProducer → Stream → Consumerの順にアニメーション表示される
4. 下部の「Consumed Messages」にメッセージが表示される

## 🛑 停止方法

### アプリケーションの停止
Ctrl+C でNext.jsアプリを停止

### Iggyサーバーの停止
```bash
docker compose down
```

データを完全に削除する場合：
```bash
docker compose down -v
```

## 📊 動作確認

### Iggyサーバーのログを確認
```bash
docker compose logs -f iggy-server
```

### サーバーの状態を確認
```bash
docker compose ps
```

### コンテナ内でIggy CLIを使う
```bash
docker exec -it iggy-server /iggy
```

## ⚠️ トラブルシューティング

### ポートが使用中の場合

**エラー**: `port is already allocated`

**解決方法**:
- Next.jsのポートを変更: `package.json` の `-p 3001` を別のポートに変更
- Iggyのポートを変更: `docker-compose.yml` のポート設定を変更

### Dockerが起動しない場合

**エラー**: `Cannot connect to the Docker daemon`

**解決方法**:
```bash
# Dockerが起動しているか確認
sudo systemctl status docker

# Dockerを起動
sudo systemctl start docker
```

### メッセージが表示されない場合

1. Iggyサーバーが正常に起動しているか確認
   ```bash
   docker compose logs iggy-server
   ```

2. ブラウザのDevToolsでエラーを確認（F12キー）

3. サーバーを再起動
   ```bash
   docker compose restart iggy-server
   ```

## 🎯 次のステップ

- **CLAUDE.md**: 詳細なアーキテクチャとコード解説
- **README.md**: 完全なドキュメント
- [Apache Iggy 公式サイト](https://iggy.apache.org/)で詳しい機能を学ぶ

## 💡 ヒント

- **自動リフレッシュ**: デフォルトでON。メッセージが自動的に更新されます
- **手動リフレッシュ**: 「Refresh」ボタンで最新のメッセージを取得
- **サーバー統計**: 画面中央にIggyサーバーの統計情報が表示されます

楽しんでください！🎊
