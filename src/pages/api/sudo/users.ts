import { NextApiRequest, NextApiResponse } from "next";
import { requireSuperAdmin, sendError } from "../../../lib/auth-middleware";
import UserModel from "../../../lib/models/user";
import { adminAuth } from "../../../lib/firebase-admin";

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
        { firebaseUid: 1, email: 1, displayName: 1, isAdmin: 1, assignedClassId: 1, createdAt: 1 }
      ).sort({ createdAt: -1 });
      return res.status(200).json({ users });
    }

    if (req.method === "PATCH") {
      await requireSuperAdmin(req);
      const { firebaseUid, isAdmin, assignedClassId } = req.body as {
        firebaseUid: string;
        isAdmin?: boolean;
        assignedClassId?: string | null;
      };

      if (!firebaseUid) {
        return sendError(res, 400, "Missing firebaseUid");
      }

      const targetUser = await UserModel.findOne({ firebaseUid });
      if (targetUser?.email === SUPER_ADMIN_EMAIL && !isAdmin) {
        return sendError(res, 400, "Cannot remove super admin privileges");
      }

      const updateData: any = {};
      if (typeof isAdmin === "boolean") updateData.isAdmin = isAdmin;
      if (assignedClassId !== undefined) updateData.assignedClassId = assignedClassId;

      const updated = await UserModel.findOneAndUpdate(
        { firebaseUid },
        updateData,
        { new: true }
      );

      if (!updated) {
        return sendError(res, 404, "User not found");
      }

      // Sync to Firebase Custom Claims for Firestore Rules secrecy
      try {
        const claims: any = { admin: updated.isAdmin };
        if (updated.assignedClassId) {
          claims.assignedClassId = updated.assignedClassId;
        }
        await adminAuth.setCustomUserClaims(firebaseUid, claims);
      } catch (claimError) {
        console.error("[sudo/users] failed to set custom claims:", claimError);
        // We continue because MongoDB is updated, but this should be logged
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
