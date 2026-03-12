import "server-only";
import mongoose from "mongoose";

export interface IContentItem {
  type: "link" | "easter_egg";
  classId: mongoose.Types.ObjectId;
  category: string;
  uploadedBy: string;
  // link fields
  title?: string;
  url?: string;
  // easter_egg fields
  name?: string;
  triggerDescription?: string;
  payload?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contentItemSchema = new mongoose.Schema<IContentItem>(
  {
    type: { type: String, required: true, enum: ["link", "easter_egg"] },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "classes",
    },
    category: { type: String, required: true },
    uploadedBy: { type: String, required: true },
    title: { type: String },
    url: { type: String },
    name: { type: String },
    triggerDescription: { type: String },
    payload: { type: String },
  },
  { timestamps: true }
);

contentItemSchema.index({ classId: 1, category: 1 });
contentItemSchema.index({ type: 1 });

let ContentItemModel: mongoose.Model<IContentItem>;

try {
  ContentItemModel = mongoose.model<IContentItem>("content_items");
} catch {
  ContentItemModel = mongoose.model<IContentItem>(
    "content_items",
    contentItemSchema
  );
}

export default ContentItemModel;
