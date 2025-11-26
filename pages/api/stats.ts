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
    const client = getIggyClient();
    const stats = await client.getStats();

    return res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("Error getting stats:", error);
    return res.status(500).json({
      error: "Failed to get stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
