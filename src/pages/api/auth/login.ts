import { NextApiRequest, NextApiResponse } from "next";
import { verifyAuth, sendError } from "../../../lib/auth-middleware";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    sendError(res, 405, "Method not allowed");
    return;
  }

  try {
    const { user, isSuperAdmin } = await verifyAuth(req);

    res.status(200).json({
      user: {
        firebaseUid: user.firebaseUid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAdmin: user.isAdmin,
        assignedClassId: user.assignedClassId,
        isSuperAdmin,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") {
      console.error("[auth/login] Unauthorized — check Firebase Admin credentials and project ID match");
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.error("[auth/login] unexpected error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
