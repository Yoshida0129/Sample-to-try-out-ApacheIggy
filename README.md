# Apache Iggy GUI Sample

Apache Iggyを使ったメッセージストリーミングのサンプルアプリケーションです。GUIでProducerからConsumerまでのデータフローを可視化できます。

## 🚀 特徴

- **リアルタイムデータフロー可視化**: Producer → Iggy Stream → Consumer のメッセージの流れをアニメーションで表示
- **TypeScript + Next.js**: モダンなWebフレームワークで構築
- **Docker Compose**: Apache Iggyサーバーを簡単にセットアップ
- **インタラクティブUI**: メッセージの送受信をGUIで操作可能

## 📋 必要な環境

- Node.js 18.x 以上
- Docker & Docker Compose
- npm または yarn

## 🔧 セットアップ

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd Sample-to-try-out-ApacheIggy
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. Apache Iggyサーバーの起動

```bash
docker compose up -d
```

サーバーが起動するまで少し待ちます（約10-30秒）。ヘルスチェックが完了するのを確認できます：

```bash
docker compose ps
```

### 4. Next.jsアプリケーションの起動

```bash
npm run dev
```

アプリケーションは http://localhost:3001 で起動します。

## 🎯 使い方

1. ブラウザで http://localhost:3001 を開く
2. 「Send Message」セクションでメッセージを入力して送信
3. メッセージがProducer → Stream → Consumerの順にアニメーション表示される
4. 下部の「Consumed Messages」セクションで受信したメッセージを確認

## 🏗️ プロジェクト構造

```
.
├── docker-compose.yml          # Apache Iggyサーバーの設定
├── pages/
│   ├── index.tsx              # メインページ（GUI）
│   ├── _app.tsx               # Next.jsアプリケーション設定
│   └── api/
│       ├── send-message.ts    # Producer API
│       ├── poll-messages.ts   # Consumer API
│       └── stats.ts           # サーバー統計API
├── lib/
│   └── iggy-client.ts         # Iggyクライアントラッパー
├── styles/
│   ├── globals.css            # グローバルスタイル
│   └── Home.module.css        # ホームページスタイル
└── package.json
```

## 📡 API エンドポイント

### POST /api/send-message
メッセージを送信（Producer）

**リクエスト:**
```json
{
  "message": "Hello, Iggy!"
}
```

**レスポンス:**
```json
{
  "success": true,
  "message": {
    "id": "msg-1234567890-abc",
    "payload": "Hello, Iggy!",
    "timestamp": 1234567890000
  }
}
```

### GET /api/poll-messages?count=50
メッセージを取得（Consumer）

**レスポンス:**
```json
{
  "success": true,
  "messages": [
    {
      "id": "msg-1234567890-abc",
      "payload": "Hello, Iggy!",
      "timestamp": 1234567890000,
      "offset": 0
    }
  ],
  "count": 1
}
```

### GET /api/stats
サーバー統計情報を取得

## 🔍 Apache Iggyについて

Apache Iggyは、Rustで書かれた高性能なメッセージストリーミングプラットフォームです。

- **超低レイテンシー**: マイクロ秒オーダーの応答時間
- **高スループット**: 毎秒数百万メッセージを処理
- **複数プロトコル対応**: QUIC、WebSocket、TCP、HTTP
- **永続化**: メッセージの永続的な保存

### 主要な概念

- **Stream**: 最上位の論理グループ（マルチテナント用）
- **Topic**: ストリーム内のメッセージカテゴリ
- **Partition**: トピック内の物理的な分割（スケーラビリティ）

## 🛠️ トラブルシューティング

### Iggyサーバーに接続できない

```bash
# サーバーのログを確認
docker compose logs iggy-server

# サーバーを再起動
docker compose restart iggy-server
```

### ポート競合

デフォルトでは以下のポートを使用します：
- **3001**: Next.jsアプリケーション
- **8080**: Iggy HTTP
- **8090**: Iggy TCP
- **3000**: Iggy QUIC

他のアプリケーションがこれらのポートを使用している場合は、`docker-compose.yml` や `package.json` の設定を変更してください。

## 📚 参考リンク

- [Apache Iggy 公式サイト](https://iggy.apache.org/)
- [Apache Iggy GitHub](https://github.com/apache/iggy)
- [Iggy Node.js Client](https://github.com/iggy-rs/iggy-node-client)
- [Next.js ドキュメント](https://nextjs.org/docs)

## 📝 ライセンス

このプロジェクトはサンプルコードです。Apache Iggyは Apache License 2.0 の下で提供されています。

## 🤝 貢献

バグ報告や機能リクエストは Issue でお願いします。
