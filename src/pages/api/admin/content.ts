import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireAdmin, sendError } from "../../../lib/auth-middleware";
import ClassModel, { IClass } from "../../../lib/models/class";
import ContentItemModel, { IContentItem } from "../../../lib/models/content-item";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    if (req.method === "GET") {
      const { user } = await requireAdmin(req);
      const { classId, category, shared, subjectName } = req.query as {
        classId: string;
        category: string;
        shared?: string;
        subjectName?: string;
      };

      if (!classId || !category) {
        return sendError(res, 400, "Missing required query params: classId, category");
      }

      const localObjectId = new mongoose.Types.ObjectId(classId);

      const items = await ContentItemModel.find({
        classId: localObjectId,
        category,
      }).sort({ createdAt: -1 });

      if (shared === "true" && subjectName) {
        // Find other classes that have a subject with the same name and shared: true
        const otherClasses = await ClassModel.find({
          _id: { $ne: localObjectId },
          "data.subjects": {
            $elemMatch: { name: subjectName, shared: true },
          },
        }).lean<IClass[]>();

        if (otherClasses.length > 0) {
          const otherClassIds = otherClasses.map((c) => c._id);

          const sharedItems = await ContentItemModel.find({
            classId: { $in: otherClassIds },
            category,
          })
            .sort({ createdAt: -1 })
            .lean<IContentItem[]>();

          // Build a classId -> class name lookup
          const classNameMap = new Map<string, string>(
            otherClasses.map((c) => [c._id.toString(), c.class])
          );

          const sharedWithSource = sharedItems.map((item) => ({
            ...item,
            sharedFrom: classNameMap.get(item.classId.toString()) ?? "Unknown",
          }));

          void user;
          return res.status(200).json({ items: [...items, ...sharedWithSource] });
        }
      }

      void user;
      return res.status(200).json({ items });
    }

    if (req.method === "POST") {
      const { user } = await requireAdmin(req);
      const body = req.body as {
        type: "link" | "easter_egg";
        classId: string;
        category: string;
        title?: string;
        url?: string;
        name?: string;
        triggerDescription?: string;
        payload?: string;
      };

      const { type, classId, category } = body;

      if (!type || !classId || !category) {
        return sendError(res, 400, "Missing required fields: type, classId, category");
      }

      if (type === "link") {
        if (!body.title || !body.url) {
          return sendError(res, 400, "Link requires title and url");
        }
        const item = await ContentItemModel.create({
          type,
          classId: new mongoose.Types.ObjectId(classId),
          category,
          uploadedBy: user.firebaseUid,
          title: body.title,
          url: body.url,
        });
        return res.status(201).json({ success: true, item });
      }

      if (type === "easter_egg") {
        if (!body.name || !body.triggerDescription || !body.payload) {
          return sendError(
            res,
            400,
            "Easter egg requires name, triggerDescription, and payload"
          );
        }
        const item = await ContentItemModel.create({
          type,
          classId: new mongoose.Types.ObjectId(classId),
          category,
          uploadedBy: user.firebaseUid,
          name: body.name,
          triggerDescription: body.triggerDescription,
          payload: body.payload,
        });
        return res.status(201).json({ success: true, item });
      }

      return sendError(res, 400, "Invalid type");
    }

    if (req.method === "DELETE") {
      await requireAdmin(req);
      const { _id } = req.body as { _id: string };
      if (!_id) return sendError(res, 400, "Missing required field: _id");

      await ContentItemModel.findByIdAndDelete(_id);
      return res.status(200).json({ success: true });
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/content] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
