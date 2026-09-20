import "server-only";
import mongoose from "mongoose";
import type { NairahServiceId } from "../../components/cv-review/nairah-services";

export interface ICvPaymentSubmission {
  fullName: string;
  email: string;
  serviceId: NairahServiceId;
  serviceTitle: string;
  priceEgp: number | null;
  paymentNoteConfirmedAt: Date;
  status: "pending" | "confirmed";
  confirmedBy?: string;
  confirmedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cvPaymentSubmissionSchema = new mongoose.Schema<ICvPaymentSubmission>(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    serviceId: {
      type: String,
      required: true,
      enum: ["cv-review", "cv-writing", "linkedin-optimization"],
    },
    serviceTitle: { type: String, required: true, maxlength: 180 },
    priceEgp: { type: Number, default: null },
    paymentNoteConfirmedAt: { type: Date, required: true },
    status: { type: String, required: true, enum: ["pending", "confirmed"], default: "pending" },
    confirmedBy: { type: String, default: undefined },
    confirmedAt: { type: Date, default: undefined },
  },
  { timestamps: true },
);

cvPaymentSubmissionSchema.index({ status: 1, createdAt: -1 });
cvPaymentSubmissionSchema.index({ email: 1, serviceId: 1, status: 1 });

const CvPaymentSubmissionModel =
  mongoose.models.cv_payment_submissions ??
  mongoose.model<ICvPaymentSubmission>(
    "cv_payment_submissions",
    cvPaymentSubmissionSchema,
  );

export default CvPaymentSubmissionModel;
