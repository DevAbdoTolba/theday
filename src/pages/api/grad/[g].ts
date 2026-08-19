import type { NextApiRequest, NextApiResponse } from "next";
import { getGradSection, fetchGradTree } from "../../../lib/grad-server";
import { serverInvalidate } from "../../../lib/server-cache";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const g = req.query.g as string;

  // Unknown keys look exactly like a route that doesn't exist; teaser
  // sections have no data to serve yet.
  const section = getGradSection(g);
  if (!section || section.teaser) {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    // Owner lever: append ?fresh=1 after editing Drive to drop this
    // instance's cached trees and rebuild immediately instead of waiting
    // out the 10-minute TTL. (Per serverless instance, hence the prefix
    // invalidation — trees are few and cheap to rebuild.)
    if (req.query.fresh === "1") {
      serverInvalidate("grad-tree:");
      serverInvalidate("grad-thumb");
    }

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
