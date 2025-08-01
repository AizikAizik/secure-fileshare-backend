import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFile extends Document {
  filename: string;
  owner: Types.ObjectId;
  encryptedKey: string; // Encrypted symmetric key for owner
  shareList: ISharedUser[]; // For shared users
  s3Key: string; // S3 object key for the encrypted file
}

interface ISharedUser {
  userId: Types.ObjectId; // Reference to the recipient user
  encryptedKey: string; // Encrypted file key specific to that user
}

const SharedUserSchema = new Schema<ISharedUser>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    encryptedKey: { type: String, required: true },
  },
  { _id: false } // Avoids creating a separate _id for each share entry
);

const fileSchema: Schema<IFile> = new Schema(
  {
    filename: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    encryptedKey: { type: String, required: true },
    shareList: { type: [SharedUserSchema], default: [] },
    s3Key: { type: String, required: true },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
  }
);

const File: Model<IFile> = mongoose.model<IFile>("File", fileSchema);
export default File;
