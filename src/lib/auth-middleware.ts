import "server-only";
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { adminAuth } from "./firebase-admin";
import UserModel, { IUser } from "./models/user";

const SUPER_ADMIN_EMAIL = "mtolba2004@gmail.com";

export function sendError(
  res: NextApiResponse,
  statusCode: number,
  message: string
): void {
  res.status(statusCode).json({ error: message });
}

export async function verifyAuth(
  req: NextApiRequest
): Promise<{ user: mongoose.HydratedDocument<IUser>; isSuperAdmin: boolean }> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.slice(7);

  let decodedToken: Awaited<ReturnType<typeof adminAuth.verifyIdToken>>;
  try {
    decodedToken = await adminAuth.verifyIdToken(token);
  } catch {
    throw new Error("Unauthorized");
  }

  if (!decodedToken.email) {
    throw new Error("Unauthorized");
  }

  const URI = process.env.MONGODB_URI;
  if (!URI) throw new Error("MONGODB_URI env var is not configured");
  await mongoose.connect(URI);

  const user = await UserModel.findOneAndUpdate(
    { firebaseUid: decodedToken.uid },
    {
      firebaseUid: decodedToken.uid,
      email: decodedToken.email ?? "",
      displayName: decodedToken.name ?? decodedToken.email ?? "",
      photoURL: decodedToken.picture ?? null,
    },
    { upsert: true, new: true }
  );

  if (!user) {
    throw new Error("Unauthorized");
  }

  return { user, isSuperAdmin: user.email === SUPER_ADMIN_EMAIL };
}

export async function requireAdmin(
  req: NextApiRequest
): Promise<{ user: mongoose.HydratedDocument<IUser> }> {
  const { user } = await verifyAuth(req);

  if (!user.isAdmin) {
    throw new Error("Forbidden");
  }

  return { user };
}

export async function requireSuperAdmin(
  req: NextApiRequest
): Promise<{ user: mongoose.HydratedDocument<IUser> }> {
  const { user } = await verifyAuth(req);

  if (user.email !== SUPER_ADMIN_EMAIL) {
    throw new Error("Forbidden");
  }

  return { user };
}
