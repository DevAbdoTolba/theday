import "server-only";
import mongoose from "mongoose";
import type { NairahServiceId } from "../../components/cv-review/nairah-services";

export interface ICvPaymentSubmission {
  instapayHandle?: string;
  email?: string;
  serviceId: NairahServiceId;
  serviceTitle: string;
  priceEgp: number | null;
  paymentConfirmedAt: Date;
  status: "pending" | "confirmed" | "declined";
  confirmedBy?: string;
  confirmedAt?: Date;
  declineReason?: string;
  declinedBy?: string;
  declinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cvPaymentSubmissionSchema = new mongoose.Schema<ICvPaymentSubmission>(
  {
    instapayHandle: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, maxlength: 254 },
    serviceId: {
      type: String,
      required: true,
      enum: ["cv-review", "cv-writing", "linkedin-optimization"],
    },
    serviceTitle: { type: String, required: true, maxlength: 180 },
    priceEgp: { type: Number, default: null },
    paymentConfirmedAt: { type: Date, required: true },
    status: { type: String, required: true, enum: ["pending", "confirmed", "declined"], default: "pending" },
    confirmedBy: { type: String, default: undefined },
    confirmedAt: { type: Date, default: undefined },
    declineReason: { type: String, trim: true, maxlength: 280, default: undefined },
    declinedBy: { type: String, default: undefined },
    declinedAt: { type: Date, default: undefined },
  },
  { timestamps: true },
);

cvPaymentSubmissionSchema.index({ status: 1, createdAt: -1 });

const CvPaymentSubmissionModel =
  mongoose.models.cv_payment_submissions ??
  mongoose.model<ICvPaymentSubmission>(
    "cv_payment_submissions",
    cvPaymentSubmissionSchema,
  );

export default CvPaymentSubmissionModel;
