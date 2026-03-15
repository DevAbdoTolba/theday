import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminForClass, sendError } from "../../../lib/auth-middleware";
import { getWriteAccessToken } from "../../../lib/google-auth-write";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "DELETE") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { fileId, classId } = req.body as { fileId: string; classId: string };
    if (!fileId || !classId) {
      return sendError(res, 400, "Missing required fields: fileId, classId");
    }

    await requireAdminForClass(req, classId);

    const accessToken = await getWriteAccessToken();
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!driveRes.ok) {
      if (driveRes.status === 404) {
        return sendError(res, 404, "File not found");
      }
      const text = await driveRes.text();
      console.error("[admin/drive-file] Drive API error:", text);
      return sendError(res, 502, "Failed to delete file from Drive");
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/drive-file] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
