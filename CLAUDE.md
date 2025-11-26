# Apache Iggy GUI Sample - Claude Documentation

このドキュメントは、Apache Iggyを使ったメッセージストリーミングサンプルアプリケーションのアーキテクチャと実装の詳細を説明します。

## 📖 プロジェクト概要

このプロジェクトは、Apache Iggyの基本的な使い方を学ぶためのGUIサンプルアプリケーションです。メッセージの送受信フローを視覚的に理解できるように設計されています。

### 技術スタック

- **フロントエンド**: Next.js 14 + TypeScript + React 18
- **バックエンド**: Next.js API Routes
- **メッセージング**: Apache Iggy (Docker)
- **Iggyクライアント**: @iggy.rs/sdk (Node.js)
- **スタイリング**: CSS Modules

## 🏗️ アーキテクチャ

### システム構成

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser (Port 3001)                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (React)                 │  │
│  │  - データフロー可視化                                    │  │
│  │  - Producer UI (メッセージ送信)                          │  │
│  │  - Consumer UI (メッセージ受信)                          │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↕ HTTP                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Next.js API Routes (Backend)               │  │
│  │  - /api/send-message    (Producer)                    │  │
│  │  - /api/poll-messages   (Consumer)                    │  │
│  │  - /api/stats           (Statistics)                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ TCP (Port 8090)
┌─────────────────────────────────────────────────────────────┐
│                 Apache Iggy Server (Docker)                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Stream: demo-stream                                  │  │
│  │    └─ Topic: demo-topic                               │  │
│  │         └─ Partition: 1                               │  │
│  └───────────────────────────────────────────────────────┘  │
│  Ports: 8080 (HTTP), 8090 (TCP), 3000 (QUIC)              │
└─────────────────────────────────────────────────────────────┘
```

### データフロー

1. **Producer (送信)**
   - ユーザーがGUIからメッセージを入力
   - フロントエンドが `/api/send-message` にPOSTリクエスト
   - API RouteがIggyクライアントを使ってメッセージを送信
   - Iggyサーバーがメッセージを `demo-stream/demo-topic` に保存

2. **Consumer (受信)**
   - フロントエンドが定期的に `/api/poll-messages` にGETリクエスト
   - API RouteがIggyクライアントを使ってメッセージをポーリング
   - 受信したメッセージをGUIに表示

3. **可視化**
   - 送信時にメッセージが Producer → Stream → Consumer の順にアニメーション表示
   - リアルタイムでメッセージの流れを確認可能

## 📁 ファイル構成と役割

### `/lib/iggy-client.ts`

Iggyクライアントのラッパークラス。主な機能：

- **接続管理**: Iggyサーバーへの接続/切断
- **Stream/Topic作成**: 存在しない場合は自動作成
- **メッセージ送信**: `sendMessage()` メソッド
- **メッセージ受信**: `pollMessages()` メソッド
- **統計情報取得**: `getStats()` メソッド

```typescript
// Singleton パターンで実装
const client = getIggyClient();
await client.sendMessage("Hello, Iggy!");
const messages = await client.pollMessages(10);
```

### `/pages/api/send-message.ts`

Producer API。メッセージを送信する。

- **Method**: POST
- **Body**: `{ message: string }`
- **Response**: `{ success: boolean, message: IggyMessage }`

### `/pages/api/poll-messages.ts`

Consumer API。メッセージを取得する。

- **Method**: GET
- **Query**: `count` (オプション、デフォルト100)
- **Response**: `{ success: boolean, messages: IggyMessage[], count: number }`

### `/pages/api/stats.ts`

統計情報API。Iggyサーバーの状態を取得する。

- **Method**: GET
- **Response**: `{ success: boolean, stats: object }`

### `/pages/index.tsx`

メインページ。GUIの実装。

主要な機能：
- メッセージ送信フォーム
- データフローアニメーション（Producer → Stream → Consumer）
- 受信メッセージ一覧表示
- サーバー統計情報表示
- 自動リフレッシュ機能

### `/docker-compose.yml`

Apache Iggyサーバーの設定。

重要な設定：
- **cap_add: SYS_NICE**: 最適なパフォーマンスのため
- **security_opt: seccomp:unconfined**: セキュリティ設定
- **ulimits: memlock**: メモリロック制限の解除
- **healthcheck**: サーバーの起動確認

## 🔧 Apache Iggyの主要概念

### Stream（ストリーム）

最上位の論理グループ。マルチテナントアプリケーションでテナントごとに分けるために使用。

```typescript
await client.streams.createStream({
  streamId: "demo-stream",
  name: "demo-stream",
});
```

### Topic（トピック）

ストリーム内のメッセージカテゴリ。異なる種類のメッセージを分類するために使用。

```typescript
await client.topics.createTopic({
  streamId: { id: "demo-stream" },
  topicId: "demo-topic",
  partitionsCount: 1,
  name: "demo-topic",
  messageExpiry: 0,
  replicationFactor: 1,
});
```

### Partition（パーティション）

トピック内の物理的な分割。スケーラビリティとパフォーマンス向上のために使用。

```typescript
// パーティションIDを指定してメッセージを送信
partitioning: { kind: "partition_id", value: 1 }
```

### Consumer Group（コンシューマーグループ）

複数のコンシューマーが協調してメッセージを処理する仕組み。

```typescript
const consumer = {
  kind: "consumer_group" as const,
  id: { id: "demo-consumer-group" },
};
```

## 🚀 実装のポイント

### 1. Singletonパターン

Iggyクライアントはコネクションを管理するため、Singletonパターンで実装しています。

```typescript
let clientInstance: IggyClientWrapper | null = null;

export function getIggyClient(): IggyClientWrapper {
  if (!clientInstance) {
    clientInstance = new IggyClientWrapper();
  }
  return clientInstance;
}
```

### 2. 自動リトライとエラーハンドリング

Stream/Topicが存在しない場合は自動的に作成します。

```typescript
async ensureStreamAndTopic(): Promise<void> {
  try {
    await this.client.streams.getStream({ streamId: { id: STREAM_ID } });
  } catch (error) {
    await this.client.streams.createStream({
      streamId: STREAM_ID,
      name: STREAM_ID,
    });
  }
}
```

### 3. メッセージのシリアライゼーション

メッセージはJSONとしてシリアライズし、Bufferとして送信します。

```typescript
const payload = JSON.stringify({
  text: message,
  timestamp: Date.now(),
});

await this.client.messages.sendMessages({
  // ...
  messages: [{
    id: messageId,
    payload: Buffer.from(payload),
    headers: {},
  }],
});
```

### 4. フロントエンドのアニメーション

メッセージのフローをステージごとにアニメーション表示します。

```typescript
// Producer ステージ
setMessageFlow((prev) => [...prev, { message, stage: "producer", timestamp: Date.now() }]);

// 0.5秒後に Stream ステージへ
setTimeout(() => {
  setMessageFlow((prev) =>
    prev.map((f) => f.message.id === messageId ? { ...f, stage: "stream" } : f)
  );
}, 500);

// 1秒後に Consumer ステージへ
setTimeout(() => {
  setMessageFlow((prev) =>
    prev.map((f) => f.message.id === messageId ? { ...f, stage: "consumer" } : f)
  );
}, 1000);
```

## 🧪 テストとデバッグ

### ローカルテスト

1. Iggyサーバーのログを確認:
   ```bash
   docker compose logs -f iggy-server
   ```

2. Next.jsのサーバーログを確認:
   ```bash
   npm run dev
   ```

3. ブラウザのDevToolsでネットワークリクエストを確認

### よくある問題

#### 接続エラー

- Iggyサーバーが起動しているか確認
- ポートが正しく開放されているか確認（8090）
- `IGGY_HOST` 環境変数が正しいか確認

#### メッセージが受信できない

- Stream/Topicが正しく作成されているか確認
- Consumer Groupが正しく設定されているか確認
- Offsetの設定を確認（最初から読み込む場合は `offset: 0`）

## 🔐 環境変数

`.env` ファイルで設定可能（`.env.example` 参照）：

```bash
IGGY_HOST=127.0.0.1      # Iggyサーバーのホスト
IGGY_PORT=8090           # Iggyサーバーのポート (TCP)
IGGY_USERNAME=iggy       # 認証ユーザー名
IGGY_PASSWORD=iggy       # 認証パスワード
```

## 📊 パフォーマンス考慮事項

1. **ポーリング間隔**: デフォルトは3秒。負荷に応じて調整可能。
2. **メッセージ取得数**: `pollMessages(count)` でバッチサイズを調整。
3. **コネクション管理**: Singletonパターンでコネクションを再利用。
4. **パーティション数**: 負荷に応じてパーティション数を増やすことで並列処理可能。

## 🎯 拡張アイデア

1. **WebSocket対応**: リアルタイムでメッセージをプッシュ
2. **複数ストリーム**: 異なるトピックを追加
3. **メトリクス**: Prometheusなどでメトリクスを収集
4. **認証**: ユーザー認証とアクセス制御
5. **スケーリング**: 複数のConsumerで負荷分散

## 📚 参考資料

- [Apache Iggy 公式ドキュメント](https://iggy.apache.org/docs/)
- [Iggy Node.js Client](https://github.com/iggy-rs/iggy-node-client)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [メッセージストリーミングの基礎](https://iggy.apache.org/docs/introduction/getting-started/)

## 🤝 コントリビューション

改善提案やバグ報告は Issue でお待ちしています。

---

**作成日**: 2025-11-26
**作成者**: Claude (Anthropic)
**バージョン**: 1.0.0
