import "server-only";
import mongoose from "mongoose";

export interface ISubjectChangeRequest {
  classId: mongoose.Types.ObjectId;
  changeType: "create" | "edit" | "delete";
  subjectName: string;
  subjectAbbreviation: string;
  shared: boolean;
  semesterIndex: number;
  originalSubjectName?: string;
  originalSubjectAbbreviation?: string;
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subjectChangeRequestSchema =
  new mongoose.Schema<ISubjectChangeRequest>(
    {
      classId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "classes",
      },
      changeType: {
        type: String,
        required: true,
        enum: ["create", "edit", "delete"],
      },
      subjectName: { type: String, required: true },
      subjectAbbreviation: { type: String, required: true },
      shared: { type: Boolean, default: false },
      semesterIndex: { type: Number, required: true },
      originalSubjectName: { type: String },
      originalSubjectAbbreviation: { type: String },
      status: {
        type: String,
        required: true,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
      requestedBy: { type: String, required: true },
      reviewedBy: { type: String },
      reviewedAt: { type: Date },
    },
    { timestamps: true }
  );

subjectChangeRequestSchema.index({ classId: 1, status: 1 });
subjectChangeRequestSchema.index({ status: 1, createdAt: -1 });
subjectChangeRequestSchema.index({ requestedBy: 1, status: 1 });

let SubjectChangeRequestModel: mongoose.Model<ISubjectChangeRequest>;

try {
  SubjectChangeRequestModel =
    mongoose.model<ISubjectChangeRequest>("subject_change_requests");
} catch {
  SubjectChangeRequestModel = mongoose.model<ISubjectChangeRequest>(
    "subject_change_requests",
    subjectChangeRequestSchema
  );
}

export default SubjectChangeRequestModel;
