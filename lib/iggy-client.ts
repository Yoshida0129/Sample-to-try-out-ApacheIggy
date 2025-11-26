import { Client } from "@iggy.rs/sdk";

const IGGY_HOST = process.env.IGGY_HOST || "127.0.0.1";
const IGGY_PORT = parseInt(process.env.IGGY_PORT || "8090");
const IGGY_USERNAME = process.env.IGGY_USERNAME || "iggy";
const IGGY_PASSWORD = process.env.IGGY_PASSWORD || "iggy";

const STREAM_ID = "demo-stream";
const TOPIC_ID = "demo-topic";
const PARTITION_COUNT = 1;

export interface IggyMessage {
  id: string;
  payload: string;
  timestamp: number;
  offset?: number;
}

export class IggyClientWrapper {
  private client: Client;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Client({
      transport: "TCP",
      options: { port: IGGY_PORT, host: IGGY_HOST },
      credentials: { username: IGGY_USERNAME, password: IGGY_PASSWORD },
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      await this.client.connect();
      this.isConnected = true;
      console.log("Connected to Iggy server");
    } catch (error) {
      console.error("Failed to connect to Iggy:", error);
      throw error;
    }
  }

  async ensureStreamAndTopic(): Promise<void> {
    await this.connect();

    try {
      // Check if stream exists, if not create it
      try {
        await this.client.streams.getStream({ streamId: { id: STREAM_ID } });
        console.log(`Stream ${STREAM_ID} already exists`);
      } catch (error) {
        console.log(`Creating stream ${STREAM_ID}...`);
        await this.client.streams.createStream({
          streamId: STREAM_ID,
          name: STREAM_ID,
        });
        console.log(`Stream ${STREAM_ID} created`);
      }

      // Check if topic exists, if not create it
      try {
        await this.client.topics.getTopic({
          streamId: { id: STREAM_ID },
          topicId: { id: TOPIC_ID },
        });
        console.log(`Topic ${TOPIC_ID} already exists`);
      } catch (error) {
        console.log(`Creating topic ${TOPIC_ID}...`);
        await this.client.topics.createTopic({
          streamId: { id: STREAM_ID },
          topicId: TOPIC_ID,
          partitionsCount: PARTITION_COUNT,
          name: TOPIC_ID,
          messageExpiry: 0,
          maxTopicSize: undefined,
          replicationFactor: 1,
        });
        console.log(`Topic ${TOPIC_ID} created`);
      }
    } catch (error) {
      console.error("Failed to ensure stream and topic:", error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<IggyMessage> {
    await this.ensureStreamAndTopic();

    try {
      const payload = JSON.stringify({
        text: message,
        timestamp: Date.now(),
      });

      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      await this.client.messages.sendMessages({
        streamId: { id: STREAM_ID },
        topicId: { id: TOPIC_ID },
        partitioning: { kind: "partition_id", value: 1 },
        messages: [
          {
            id: messageId,
            payload: Buffer.from(payload),
            headers: {},
          },
        ],
      });

      console.log(`Message sent: ${messageId}`);

      return {
        id: messageId,
        payload: message,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  async pollMessages(count: number = 10): Promise<IggyMessage[]> {
    await this.ensureStreamAndTopic();

    try {
      const consumer = {
        kind: "consumer_group" as const,
        id: { id: "demo-consumer-group" },
      };

      const response = await this.client.messages.pollMessages({
        streamId: { id: STREAM_ID },
        topicId: { id: TOPIC_ID },
        partitionId: 1,
        consumer,
        pollingStrategy: { kind: "offset", value: BigInt(0) },
        count,
        autoCommit: true,
      });

      const messages: IggyMessage[] = response.messages.map((msg) => {
        try {
          const payload = JSON.parse(msg.payload.toString());
          return {
            id: msg.id?.toString() || "unknown",
            payload: payload.text || msg.payload.toString(),
            timestamp: payload.timestamp || Date.now(),
            offset: Number(msg.offset),
          };
        } catch {
          return {
            id: msg.id?.toString() || "unknown",
            payload: msg.payload.toString(),
            timestamp: Date.now(),
            offset: Number(msg.offset),
          };
        }
      });

      console.log(`Polled ${messages.length} messages`);
      return messages;
    } catch (error) {
      console.error("Failed to poll messages:", error);
      throw error;
    }
  }

  async getStats() {
    await this.connect();
    try {
      const stats = await this.client.system.getStats();
      return stats;
    } catch (error) {
      console.error("Failed to get stats:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConnected) return;

    try {
      await this.client.disconnect();
      this.isConnected = false;
      console.log("Disconnected from Iggy server");
    } catch (error) {
      console.error("Failed to disconnect from Iggy:", error);
    }
  }
}

// Singleton instance
let clientInstance: IggyClientWrapper | null = null;

export function getIggyClient(): IggyClientWrapper {
  if (!clientInstance) {
    clientInstance = new IggyClientWrapper();
  }
  return clientInstance;
}
