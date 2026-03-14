import { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, sendError } from "../../../lib/auth-middleware";
import ClassModel from "../../../lib/models/class";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    await requireAdmin(req);
    const classes = await ClassModel.find({}, { _id: 1, class: 1, data: 1 }).sort(
      { class: 1 }
    );
    return res.status(200).json({ classes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/classes] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
