import { useState, useEffect } from "react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

interface Message {
  id: string;
  payload: string;
  timestamp: number;
  offset?: number;
}

interface MessageFlow {
  message: Message;
  stage: "producer" | "stream" | "consumer";
  timestamp: number;
}

export default function Home() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageFlow, setMessageFlow] = useState<MessageFlow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const sendMessage = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Visualize message flow
      const newFlow: MessageFlow = {
        message: data.message,
        stage: "producer",
        timestamp: Date.now(),
      };

      setMessageFlow((prev) => [...prev, newFlow]);

      // Animate through stages
      setTimeout(() => {
        setMessageFlow((prev) =>
          prev.map((f) =>
            f.message.id === data.message.id ? { ...f, stage: "stream" } : f
          )
        );
      }, 500);

      setTimeout(() => {
        setMessageFlow((prev) =>
          prev.map((f) =>
            f.message.id === data.message.id ? { ...f, stage: "consumer" } : f
          )
        );
      }, 1000);

      // Remove from flow after animation
      setTimeout(() => {
        setMessageFlow((prev) =>
          prev.filter((f) => f.message.id !== data.message.id)
        );
      }, 3000);

      setMessage("");
      pollMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async () => {
    try {
      const response = await fetch("/api/poll-messages?count=50");
      const data = await response.json();

      if (response.ok) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error("Failed to poll messages:", err);
    }
  };

  const getStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to get stats:", err);
    }
  };

  useEffect(() => {
    pollMessages();
    getStats();

    if (autoRefresh) {
      const interval = setInterval(() => {
        pollMessages();
        getStats();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Apache Iggy GUI Sample</title>
        <meta name="description" content="Apache Iggy messaging flow visualization" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Apache Iggy <span className={styles.highlight}>Message Streaming</span>
        </h1>

        <p className={styles.description}>
          Visualize the message flow from Producer to Consumer
        </p>

        {error && <div className={styles.error}>{error}</div>}

        {/* Data Flow Visualization */}
        <div className={styles.flowContainer}>
          <div className={styles.flowStage}>
            <h2>📤 Producer</h2>
            <div className={styles.stageBox}>
              {messageFlow
                .filter((f) => f.stage === "producer")
                .map((f) => (
                  <div key={f.message.id} className={styles.flowMessage}>
                    {f.message.payload}
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowStage}>
            <h2>🌊 Iggy Stream</h2>
            <div className={styles.stageBox}>
              {messageFlow
                .filter((f) => f.stage === "stream")
                .map((f) => (
                  <div key={f.message.id} className={styles.flowMessage}>
                    {f.message.payload}
                  </div>
                ))}
            </div>
          </div>

          <div className={styles.flowArrow}>→</div>

          <div className={styles.flowStage}>
            <h2>📥 Consumer</h2>
            <div className={styles.stageBox}>
              {messageFlow
                .filter((f) => f.stage === "consumer")
                .map((f) => (
                  <div key={f.message.id} className={styles.flowMessage}>
                    {f.message.payload}
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Producer Section */}
        <div className={styles.section}>
          <h2>Send Message</h2>
          <div className={styles.inputGroup}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
              className={styles.input}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className={styles.section}>
            <h2>Server Statistics</h2>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <span>Process ID:</span> <strong>{stats.process_id}</strong>
              </div>
              <div className={styles.stat}>
                <span>Messages Size:</span>{" "}
                <strong>{stats.messages_size_bytes} bytes</strong>
              </div>
              <div className={styles.stat}>
                <span>Streams Count:</span>{" "}
                <strong>{stats.streams_count}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Consumer Section */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Consumed Messages ({messages.length})</h2>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <button onClick={pollMessages} className={styles.button}>
              Refresh
            </button>
          </div>
          <div className={styles.messageList}>
            {messages.length === 0 ? (
              <p className={styles.emptyState}>
                No messages yet. Send a message to get started!
              </p>
            ) : (
              messages
                .slice()
                .reverse()
                .map((msg) => (
                  <div key={msg.id} className={styles.messageCard}>
                    <div className={styles.messageHeader}>
                      <span className={styles.messageId}>ID: {msg.id}</span>
                      {msg.offset !== undefined && (
                        <span className={styles.messageOffset}>
                          Offset: {msg.offset}
                        </span>
                      )}
                    </div>
                    <div className={styles.messagePayload}>{msg.payload}</div>
                    <div className={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://iggy.apache.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by Apache Iggy
        </a>
      </footer>
    </div>
  );
}
