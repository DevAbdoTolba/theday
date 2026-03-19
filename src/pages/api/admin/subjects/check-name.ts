import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireAdmin, sendError } from "../../../../lib/auth-middleware";
import ClassModel, { IClass } from "../../../../lib/models/class";

interface CheckNameResponse {
  existsInOtherClasses: boolean;
  matchingClasses: Array<{ classId: string; className: string }>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CheckNameResponse | { error: string }>
): Promise<void> {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    await requireAdmin(req);

    const { classId, name } = req.query;

    if (
      !classId ||
      !name ||
      typeof classId !== "string" ||
      typeof name !== "string"
    ) {
      return sendError(res, 400, "Missing required query parameters: classId and name");
    }

    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const matchingClasses: mongoose.HydratedDocument<IClass>[] =
      await ClassModel.find({
        _id: { $ne: new mongoose.Types.ObjectId(classId) },
        "data.subjects.name": { $regex: new RegExp(`^${escapedName}$`, "i") },
      });

    const result: CheckNameResponse = {
      existsInOtherClasses: matchingClasses.length > 0,
      matchingClasses: matchingClasses.map((cls) => ({
        classId: cls._id.toString(),
        className: cls.class,
      })),
    };

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/subjects/check-name] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
