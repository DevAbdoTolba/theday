import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { requireAdminForClass, sendError } from "../../../lib/auth-middleware";

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "GET") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { subject, classId } = req.query as { subject: string; classId?: string };
    if (!subject || !classId) {
      return sendError(res, 400, "Missing required query params: subject, classId");
    }

    await requireAdminForClass(req, classId);

    const clientEmail = process.env.CLIENT_EMAIL;
    const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!clientEmail || !privateKey) {
      return sendError(res, 500, "Missing Google credentials");
    }

    const auth = new google.auth.GoogleAuth({
      credentials: { client_email: clientEmail, private_key: privateKey },
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });

    const drive = google.drive({ version: "v3", auth });

    const safeSubject = escapeDriveQuery(subject);
    const { data: subjectFolders } = await drive.files.list({
      q: `name = '${safeSubject}' and mimeType = 'application/vnd.google-apps.folder'`,
      fields: "files(id, name)",
    });

    if (!subjectFolders.files || subjectFolders.files.length === 0) {
      return res.status(200).json({ folders: [] });
    }

    const folders: { id: string; name: string }[] = [];

    for (const subjectFolder of subjectFolders.files) {
      if (!subjectFolder.id) continue;
      const { data: subFolders } = await drive.files.list({
        q: `mimeType = 'application/vnd.google-apps.folder' and '${subjectFolder.id}' in parents`,
        fields: "files(id, name)",
        pageSize: 1000,
      });

      if (subFolders.files) {
        for (const folder of subFolders.files) {
          if (folder.id && folder.name) {
            folders.push({ id: folder.id, name: folder.name });
          }
        }
      }
    }

    return res.status(200).json({ folders });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/drive-folders] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
