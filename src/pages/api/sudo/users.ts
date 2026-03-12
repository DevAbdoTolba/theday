import { NextApiRequest, NextApiResponse } from "next";
import { requireSuperAdmin, sendError } from "../../../lib/auth-middleware";
import UserModel from "../../../lib/models/user";

const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      await requireSuperAdmin(req);
      const users = await UserModel.find(
        {},
        { firebaseUid: 1, email: 1, displayName: 1, isAdmin: 1, createdAt: 1 }
      ).sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    if (req.method === "PATCH") {
      await requireSuperAdmin(req);
      const { firebaseUid, isAdmin } = req.body as {
        firebaseUid: string;
        isAdmin: boolean;
      };

      if (!firebaseUid || typeof isAdmin !== "boolean") {
        return sendError(res, 400, "Missing required fields");
      }

      const targetUser = await UserModel.findOne({ firebaseUid });
      if (targetUser?.email === SUPER_ADMIN_EMAIL && !isAdmin) {
        return sendError(res, 400, "Cannot remove super admin privileges");
      }

      const updated = await UserModel.findOneAndUpdate(
        { firebaseUid },
        { isAdmin },
        { new: true }
      );

      if (!updated) {
        return sendError(res, 404, "User not found");
      }

      return res.status(200).json({ success: true, user: updated });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[sudo/users] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
