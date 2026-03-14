import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireSuperAdmin, sendError } from "../../../lib/auth-middleware";
import ClassModel from "../../../lib/models/class";
import ContentItemModel from "../../../lib/models/content-item";
import SubjectChangeRequestModel from "../../../lib/models/subject-change-request";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      await requireSuperAdmin(req);
      const classes = await ClassModel.find({}).sort({ class: 1 });
      return res.status(200).json({ classes });
    }

    if (req.method === "POST") {
      await requireSuperAdmin(req);
      const { class: className, data } = req.body as {
        class: string;
        data: unknown[];
      };
      if (!className) {
        return sendError(res, 400, "Missing required field: class");
      }
      const created = await ClassModel.create({
        class: className,
        data: data ?? [],
      });
      return res.status(201).json({ success: true, class: created });
    }

    if (req.method === "PUT") {
      await requireSuperAdmin(req);
      const { _id, class: className, data } = req.body as {
        _id: string;
        class: string;
        data: unknown[];
      };
      if (!_id || !className) {
        return sendError(res, 400, "Missing required fields: _id, class");
      }
      const updated = await ClassModel.findByIdAndUpdate(
        _id,
        { class: className, data: data ?? [] },
        { new: true }
      );
      if (!updated) return sendError(res, 404, "Class not found");
      return res.status(200).json({ success: true, class: updated });
    }

    if (req.method === "DELETE") {
      await requireSuperAdmin(req);
      const { _id } = req.body as { _id: string };
      if (!_id) return sendError(res, 400, "Missing required field: _id");

      const contentCount = await ContentItemModel.countDocuments({
        classId: new mongoose.Types.ObjectId(_id),
      });
      if (contentCount > 0) {
        return sendError(res, 400, "Class has content — delete content first");
      }

      // Clean up pending subject change requests for this class
      await SubjectChangeRequestModel.deleteMany({
        classId: new mongoose.Types.ObjectId(_id),
      });

      await ClassModel.findByIdAndDelete(_id);
      return res.status(200).json({ success: true });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[sudo/classes] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
