import type { NextApiRequest, NextApiResponse } from "next";
import { connectMongo } from "../../lib/mongo";
import CvSupportContactModel from "../../lib/models/cv-support-contact";

const NAIRAH_SUPPORT_PHONE = {
  display: "01114117164",
  e164: "+201114117164",
} as const;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    await connectMongo();
    const contact = await CvSupportContactModel.findOneAndUpdate(
      { key: "nairah" },
      {
        $setOnInsert: {
          key: "nairah",
          phoneDisplay: NAIRAH_SUPPORT_PHONE.display,
          phoneE164: NAIRAH_SUPPORT_PHONE.e164,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const whatsappNumber = contact.phoneE164.replace(/\D/g, "");
    res.status(200).json({
      phone: contact.phoneDisplay,
      whatsappUrl: `https://wa.me/${whatsappNumber}`,
    });
  } catch (error) {
    console.error("[cv-support] failed to reveal contact:", error);
    res.status(500).json({ error: "Could not load the support number. Please try again." });
  }
}
