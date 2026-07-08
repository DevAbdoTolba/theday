import type { NextApiRequest, NextApiResponse } from "next";
import { getGradSection, fetchGradTree } from "../../../lib/grad-server";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const g = req.query.g as string;

  // Unknown keys look exactly like a route that doesn't exist.
  if (!getGradSection(g)) {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    const tree = await fetchGradTree(g);
    if (!tree) {
      return res.status(404).json({ message: "Not found" });
    }
    // Keep the section out of shared/proxy caches
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.status(200).json({ tree });
  } catch (error) {
    console.error("[grad] tree fetch failed:", (error as Error).message);
    return res.status(500).json({ message: "Failed to load section" });
  }
}
