import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IFile extends Document {
  filename: string;
  owner: Types.ObjectId;
  encryptedKey: string; // Encrypted symmetric key for owner
  shareList: { userId: Types.ObjectId; encryptedKey: string }[]; // For shared users
  s3Key: string; // S3 object key for the encrypted file
}

const fileSchema: Schema<IFile> = new Schema({
  filename: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  encryptedKey: { type: String, required: true },
  shareList: [
    {
      userId: { type: Schema.Types.ObjectId, ref: "User" },
      encryptedKey: { type: String },
    },
  ],
  s3Key: { type: String, required: true },
});

const File: Model<IFile> = mongoose.model<IFile>("File", fileSchema);
export default File;
