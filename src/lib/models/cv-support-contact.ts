import "server-only";
import mongoose from "mongoose";

export interface ICvSupportContact {
  key: "nairah";
  phoneDisplay: string;
  phoneE164: string;
  createdAt: Date;
  updatedAt: Date;
}

const cvSupportContactSchema = new mongoose.Schema<ICvSupportContact>(
  {
    key: { type: String, required: true, unique: true, enum: ["nairah"] },
    phoneDisplay: { type: String, required: true },
    phoneE164: { type: String, required: true },
  },
  { timestamps: true },
);

const CvSupportContactModel =
  mongoose.models.cv_support_contacts ??
  mongoose.model<ICvSupportContact>("cv_support_contacts", cvSupportContactSchema);

export default CvSupportContactModel;
