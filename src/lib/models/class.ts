import "server-only";
import mongoose from "mongoose";

interface ISubject {
  name: string;
  abbreviation: string;
  shared?: boolean;
}

interface IDataEntry {
  index: number;
  subjects: ISubject[];
}

export interface IClass {
  _id: mongoose.Types.ObjectId;
  class: string;
  data: IDataEntry[];
}

const classSchema = new mongoose.Schema<IClass>({
  class: { type: String, required: true },
  data: [
    {
      index: Number,
      subjects: [
        {
          name: String,
          abbreviation: String,
          shared: { type: Boolean, default: false },
        },
      ],
    },
  ],
});

let ClassModel: mongoose.Model<IClass>;

try {
  ClassModel = mongoose.model<IClass>("classes");
} catch {
  ClassModel = mongoose.model<IClass>("classes", classSchema);
}

export default ClassModel;
