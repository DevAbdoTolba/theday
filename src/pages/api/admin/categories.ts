import { NextApiRequest, NextApiResponse } from "next";
import { google, drive_v3 } from "googleapis";
import mongoose from "mongoose";
import { requireAdminForClass, sendError } from "../../../lib/auth-middleware";
import ContentItemModel from "../../../lib/models/content-item";
import { serverGet, serverSet, serverInvalidate } from "../../../lib/server-cache";

function escapeDriveQuery(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function getReadonlyDrive(): drive_v3.Drive {
  const clientEmail = process.env.CLIENT_EMAIL;
  const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) {
    throw new Error("Missing Google credentials");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email: clientEmail, private_key: privateKey },
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
  });

  return google.drive({ version: "v3", auth });
}

function getWriteDrive(): drive_v3.Drive {
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

async function findSubjectFolder(
  drive: drive_v3.Drive,
  subjectAbbreviation: string
): Promise<string | null> {
  const safe = escapeDriveQuery(subjectAbbreviation);
  const { data } = await drive.files.list({
    q: `name = '${safe}' and mimeType = 'application/vnd.google-apps.folder'`,
    fields: "files(id, name)",
  });

  if (!data.files || data.files.length === 0) {
    return null;
  }

  return data.files[0].id ?? null;
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { classId, subject } = req.query as {
    classId?: string;
    subject?: string;
  };

  if (!classId || !subject) {
    return sendError(
      res,
      400,
      "Missing required query params: classId, subject"
    );
  }

  await requireAdminForClass(req, classId);

  // Server-side cache for Drive API calls
  const cacheKey = `categories:${subject}`;
  const cached = serverGet<{ name: string; folderId: string }[]>(cacheKey);
  if (cached) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
    return res.status(200).json({ categories: cached });
  }

  const drive = getReadonlyDrive();
  const subjectFolderId = await findSubjectFolder(drive, subject);

  if (!subjectFolderId) {
    res.setHeader(
      "Cache-Control",
      "public, max-age=60, stale-while-revalidate=300"
    );
    serverSet(cacheKey, []);
    return res.status(200).json({ categories: [] });
  }

  const { data } = await drive.files.list({
    q: `mimeType = 'application/vnd.google-apps.folder' and '${subjectFolderId}' in parents`,
    fields: "files(id, name)",
    pageSize: 1000,
  });

  const categories: { name: string; folderId: string }[] = [];

  if (data.files) {
    for (const file of data.files) {
      if (file.id && file.name) {
        categories.push({ name: file.name, folderId: file.id });
      }
    }
  }

  serverSet(cacheKey, categories);
  res.setHeader(
    "Cache-Control",
    "public, max-age=60, stale-while-revalidate=300"
  );
  return res.status(200).json({ categories });
}

async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { classId, subjectAbbreviation, categoryName } = req.body as {
    classId?: string;
    subjectAbbreviation?: string;
    categoryName?: string;
  };

  if (!classId || !subjectAbbreviation || !categoryName) {
    return sendError(
      res,
      400,
      "Missing required fields: classId, subjectAbbreviation, categoryName"
    );
  }

  await requireAdminForClass(req, classId);

  const drive = getWriteDrive();
  const subjectFolderId = await findSubjectFolder(drive, subjectAbbreviation);

  if (!subjectFolderId) {
    return sendError(res, 404, "Subject folder not found");
  }

  const { data: created } = await drive.files.create({
    requestBody: {
      name: categoryName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [subjectFolderId],
    },
    fields: "id, name",
  });

  if (!created.id || !created.name) {
    return sendError(res, 500, "Failed to create category folder");
  }

  serverInvalidate(`categories:${subjectAbbreviation}`);
  return res.status(201).json({ name: created.name, folderId: created.id });
}

async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { folderId, newName, classId } = req.body as {
    folderId?: string;
    newName?: string;
    classId?: string;
  };

  if (!folderId || !newName || !classId) {
    return sendError(res, 400, "Missing required fields: folderId, newName, classId");
  }

  await requireAdminForClass(req, classId);

  const drive = getWriteDrive();

  const { data: updated } = await drive.files.update({
    fileId: folderId,
    requestBody: { name: newName },
    fields: "id, name",
  });

  if (!updated.id || !updated.name) {
    return sendError(res, 500, "Failed to rename category folder");
  }

  serverInvalidate("categories:");
  return res.status(200).json({ name: updated.name, folderId: updated.id });
}

async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const { folderId, classId } = req.query as { folderId?: string; classId?: string };

  if (!folderId || !classId) {
    return sendError(res, 400, "Missing required query params: folderId, classId");
  }

  await requireAdminForClass(req, classId);

  const drive = getWriteDrive();

  // Look up the folder name before deleting so we can clean up content_items
  const { data: folder } = await drive.files.get({
    fileId: folderId,
    fields: "name",
  });

  const folderName = folder.name;

  // Delete the folder from Google Drive (recursively deletes contents)
  await drive.files.delete({ fileId: folderId });

  serverInvalidate("categories:");

  // Delete matching content_items from MongoDB
  if (folderName) {
    const URI = process.env.MONGODB_URI;
    if (URI) {
      await mongoose.connect(URI);
      await ContentItemModel.deleteMany({ category: folderName });
    }
  }

  return res.status(200).json({ deleted: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      case "PUT":
        return await handlePut(req, res);
      case "DELETE":
        return await handleDelete(req, res);
      default:
        return sendError(res, 405, "Method not allowed");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    if (message === "Missing Google credentials") {
      return sendError(res, 500, "Missing Google credentials");
    }
    console.error("[admin/categories] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
