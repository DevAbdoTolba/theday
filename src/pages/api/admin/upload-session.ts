import { NextApiRequest, NextApiResponse } from "next";
import { requireAdminForClass, sendError } from "../../../lib/auth-middleware";
import { getWriteAccessToken } from "../../../lib/google-auth-write";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { fileName, mimeType, folderId, classId } = req.body as {
      fileName: string;
      mimeType: string;
      folderId: string;
      classId: string;
    };

    if (!fileName || !mimeType || !folderId || !classId) {
      return sendError(res, 400, "Missing required fields: fileName, mimeType, folderId, classId");
    }

    await requireAdminForClass(req, classId);

    const accessToken = await getWriteAccessToken();

    const initResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType,
        },
        body: JSON.stringify({
          name: fileName,
          parents: [folderId],
        }),
      }
    );

    if (!initResponse.ok) {
      const text = await initResponse.text();
      console.error("[admin/upload-session] Drive API error:", text);
      return sendError(res, 502, "Failed to create upload session");
    }

    const sessionUri = initResponse.headers.get("Location");
    if (!sessionUri) {
      return sendError(res, 502, "Drive did not return a session URI");
    }

    return res.status(200).json({ sessionUri });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/upload-session] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
