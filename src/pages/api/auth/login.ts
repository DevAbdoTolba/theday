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
        isSuperAdmin,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";

    if (message === "Forbidden") {
      sendError(res, 403, message);
    } else {
      sendError(res, 401, "Unauthorized");
    }
  }
}
