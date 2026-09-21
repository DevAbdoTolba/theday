import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { requireCvPaymentAdmin, sendError } from "../../../lib/auth-middleware";
import CvPaymentSubmissionModel, {
  type ICvPaymentSubmission,
} from "../../../lib/models/cv-payment-submission";

interface PaymentSubmissionResponse {
  readonly id: string;
  readonly instapayHandle: string | null;
  readonly email: string | null;
  readonly serviceTitle: string;
  readonly priceEgp: number | null;
  readonly status: "pending" | "confirmed" | "declined";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
  readonly declineReason: string | null;
  readonly declinedAt: string | null;
}

type PaymentStatusFilter = "all" | "pending" | "confirmed" | "declined";

function readQueryValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function serializeSubmission(
  submission: mongoose.HydratedDocument<ICvPaymentSubmission>,
): PaymentSubmissionResponse {
  return {
    id: submission._id.toString(),
    instapayHandle: submission.instapayHandle ?? null,
    email: submission.email ?? null,
    serviceTitle: submission.serviceTitle,
    priceEgp: submission.priceEgp,
    status: submission.status,
    createdAt: submission.createdAt.toISOString(),
    confirmedAt: submission.confirmedAt?.toISOString() ?? null,
    declineReason: submission.declineReason ?? null,
    declinedAt: submission.declinedAt?.toISOString() ?? null,
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    const { user } = await requireCvPaymentAdmin(req);

    if (req.method === "GET") {
      const requestedPage = Number.parseInt(readQueryValue(req.query.page) ?? "1", 10);
      const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
      const pageSize = 10;
      const requestedStatus = readQueryValue(req.query.status);
      const status: PaymentStatusFilter = requestedStatus === "pending" || requestedStatus === "confirmed" || requestedStatus === "declined" ? requestedStatus : "all";
      const filter = status === "all" ? {} : { status };
      const [submissions, total, all, pending, confirmed, declined] = await Promise.all([
        CvPaymentSubmissionModel.find(filter)
          .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize),
        CvPaymentSubmissionModel.countDocuments(filter),
        CvPaymentSubmissionModel.countDocuments({}),
        CvPaymentSubmissionModel.countDocuments({ status: "pending" }),
        CvPaymentSubmissionModel.countDocuments({ status: "confirmed" }),
        CvPaymentSubmissionModel.countDocuments({ status: "declined" }),
      ]);
      res.status(200).json({
        submissions: submissions.map(serializeSubmission),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
        counts: { all, pending, confirmed, declined },
      });
      return;
    }

    if (req.method === "PATCH") {
      const { submissionId, action, reason } = req.body as {
        submissionId?: unknown;
        action?: unknown;
        reason?: unknown;
      };
      if (typeof submissionId !== "string" || !mongoose.isValidObjectId(submissionId)) {
        return sendError(res, 400, "Invalid payment submission.");
      }
      if (action !== "confirm" && action !== "decline") {
        return sendError(res, 400, "Invalid payment action.");
      }

      const declineReason = typeof reason === "string" ? reason.trim() : "";
      if (action === "decline" && (declineReason.length < 3 || declineReason.length > 280)) {
        return sendError(res, 400, "Add a decline reason between 3 and 280 characters.");
      }

      const submission = await CvPaymentSubmissionModel.findOneAndUpdate(
        { _id: submissionId },
        action === "confirm"
          ? {
              $set: {
                status: "confirmed",
                confirmedBy: user.email,
                confirmedAt: new Date(),
              },
              $unset: { declineReason: 1, declinedBy: 1, declinedAt: 1 },
            }
          : {
              $set: {
                status: "declined",
                declineReason,
                declinedBy: user.email,
                declinedAt: new Date(),
              },
              $unset: { confirmedBy: 1, confirmedAt: 1 },
            },
        { new: true },
      );
      if (!submission) {
        return sendError(res, 404, "Payment submission was not found.");
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
