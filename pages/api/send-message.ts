import type { NextApiRequest, NextApiResponse } from "next";
import { getIggyClient } from "../../lib/iggy-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = getIggyClient();
    const sentMessage = await client.sendMessage(message);

    return res.status(200).json({
      success: true,
      message: sentMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      error: "Failed to send message",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
