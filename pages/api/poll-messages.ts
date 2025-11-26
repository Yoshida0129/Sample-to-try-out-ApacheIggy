import type { NextApiRequest, NextApiResponse } from "next";
import { getIggyClient } from "../../lib/iggy-client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const count = parseInt(req.query.count as string) || 100;

    const client = getIggyClient();
    const messages = await client.pollMessages(count);

    return res.status(200).json({
      success: true,
      messages,
      count: messages.length,
    });
  } catch (error) {
    console.error("Error polling messages:", error);
    return res.status(500).json({
      error: "Failed to poll messages",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
