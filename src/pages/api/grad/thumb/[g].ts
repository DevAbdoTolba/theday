import type { NextApiRequest, NextApiResponse } from "next";
import { getGradSection, fetchGradThumb } from "../../../../lib/grad-server";

const ALLOWED_SIZES = new Set([220, 400, 800]);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const g = req.query.g as string;
  const id = req.query.id as string;
  const szRaw = parseInt((req.query.sz as string) ?? "400", 10);
  const sz = ALLOWED_SIZES.has(szRaw) ? szRaw : 400;

  const section = getGradSection(g);
  if (!section || section.teaser || !id) {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    const thumb = await fetchGradThumb(g, id, sz);
    if (!thumb) {
      return res.status(404).json({ message: "Not found" });
    }
    res.setHeader("Content-Type", thumb.mime);
    res.setHeader("Cache-Control", "private, max-age=86400");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    return res.status(200).send(Buffer.from(thumb.data, "base64"));
  } catch (error) {
    console.error("[grad] thumb fetch failed:", (error as Error).message);
    return res.status(404).json({ message: "Not found" });
  }
}
