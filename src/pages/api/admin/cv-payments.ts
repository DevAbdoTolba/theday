import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireAdmin, sendError } from "../../../lib/auth-middleware";
import CvPaymentSubmissionModel, {
  type ICvPaymentSubmission,
} from "../../../lib/models/cv-payment-submission";

interface PaymentSubmissionResponse {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly serviceTitle: string;
  readonly priceEgp: number | null;
  readonly status: "pending" | "confirmed";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
}

function serializeSubmission(
  submission: mongoose.HydratedDocument<ICvPaymentSubmission>,
): PaymentSubmissionResponse {
  return {
    id: submission._id.toString(),
    email: submission.email ?? null,
    phone: submission.phone ?? null,
    serviceTitle: submission.serviceTitle,
    priceEgp: submission.priceEgp,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
    confirmedAt: submission.confirmedAt?.toISOString() ?? null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const { user } = await requireAdmin(req);

    if (req.method === "GET") {
      const submissions = await CvPaymentSubmissionModel.find({})
        .sort({ createdAt: -1 })
        .limit(100);
      res.status(200).json({
        submissions: submissions.map(serializeSubmission),
      });
      return;
    }

    if (req.method === "PATCH") {
      const { submissionId, action } = req.body as {
        submissionId?: unknown;
        action?: unknown;
      };
      if (typeof submissionId !== "string" || !mongoose.isValidObjectId(submissionId)) {
        return sendError(res, 400, "Invalid payment submission.");
      }
      if (action !== "confirm") {
        return sendError(res, 400, "Invalid payment action.");
      }

      const submission = await CvPaymentSubmissionModel.findOneAndUpdate(
        { _id: submissionId, status: "pending" },
        {
          status: "confirmed",
          confirmedBy: user.email,
          confirmedAt: new Date(),
        },
        { new: true },
      );
      if (!submission) {
        return sendError(res, 404, "Payment submission is no longer pending.");
      }

      res.status(200).json({ submission: serializeSubmission(submission) });
      return;
    }

    return sendError(res, 405, "Method not allowed");
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "Unauthorized") return sendError(res, 401, "Unauthorized");
    if (message === "Forbidden") return sendError(res, 403, "Forbidden");
    console.error("[admin/cv-payments] unexpected error:", error);
    return sendError(res, 500, "Internal server error");
  }
}
