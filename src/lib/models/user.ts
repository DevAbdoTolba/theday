import mongoose from "mongoose";

export interface IUser {
  firebaseUid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    photoURL: { type: String, default: null },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

let UserModel: mongoose.Model<IUser>;

try {
  UserModel = mongoose.model<IUser>("users");
} catch {
  UserModel = mongoose.model<IUser>("users", userSchema);
}

export default UserModel;
