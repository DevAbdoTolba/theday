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
  readonly status: "pending" | "confirmed";
  readonly createdAt: string;
  readonly confirmedAt: string | null;
}

type PaymentStatusFilter = "all" | "pending" | "confirmed";

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
      const status: PaymentStatusFilter = requestedStatus === "pending" || requestedStatus === "confirmed" ? requestedStatus : "all";
      const filter = status === "all" ? {} : { status };
      const [submissions, total, pending, confirmed] = await Promise.all([
        CvPaymentSubmissionModel.find(filter)
        .sort({ createdAt: -1 })
          .skip((page - 1) * pageSize)
          .limit(pageSize),
        CvPaymentSubmissionModel.countDocuments(filter),
        CvPaymentSubmissionModel.countDocuments({ status: "pending" }),
        CvPaymentSubmissionModel.countDocuments({ status: "confirmed" }),
      ]);
      res.status(200).json({
        submissions: submissions.map(serializeSubmission),
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.max(1, Math.ceil(total / pageSize)),
        },
        counts: { all: pending + confirmed, pending, confirmed },
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
