import { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";
import { requireAdminForClass, sendError } from "../../../lib/auth-middleware";

function getWriteDrive() {
  const clientEmail = process.env.CLIENT_EMAIL;
  const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google credentials");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/drive"],
  });

  return google.drive({ version: "v3", auth });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.method !== "POST") {
    return sendError(res, 405, "Method not allowed");
  }

  try {
    const { url, title, folderId, classId } = req.body as {
      url?: string;
      title?: string;
      folderId?: string;
      classId?: string;
    };

    if (!url || !title || !folderId || !classId) {
      return sendError(res, 400, "Missing required fields: url, title, folderId, classId");
    }

    await requireAdminForClass(req, classId);

    // Student-facing parser expects filename format: "https://... Display Name"
    const fileName = `${url} ${title}`;

    const drive = getWriteDrive();

    const { data } = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [folderId],
        mimeType: "text/plain",
      },
      fields: "id, name",
    });

    return res.status(201).json({ id: data.id, name: data.name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized")
      return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/link] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
