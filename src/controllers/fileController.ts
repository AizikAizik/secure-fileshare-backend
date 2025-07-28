import { Request, Response } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import File, { IFile } from "../models/File";
import dotenv from "dotenv";
import { protect } from "../middleware/authMiddleware"; // To use in routes later

dotenv.config();
// Initialize S3 client
if (
  !process.env.AWS_REGION ||
  !process.env.AWS_ACCESS_KEY_ID ||
  !process.env.AWS_SECRET_ACCESS_KEY ||
  !process.env.S3_BUCKET_NAME
) {
  throw new Error("Missing AWS configuration in environment variables");
}

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

const upload = multer({ storage: multer.memoryStorage() }); // In-memory for S3 upload

export const uploadFile = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const { filename, encryptedKey }: { filename: string; encryptedKey: string } =
    req.body;
  const fileBuffer: Buffer | undefined = req.file?.buffer;

  if (!fileBuffer) {
    res.status(400).json({ error: "No file provided" });
    return;
  }

  const s3Key: string = `${Date.now()}-${filename}`;

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME as string,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: req.file?.mimetype,
      })
    );

    const newFile: IFile = new File({
      filename,
      owner: req.user?.id,
      encryptedKey,
      shareList: [],
      s3Key,
    });
    await newFile.save();

    res.json({ message: "File uploaded securely", fileId: newFile._id });
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      console.error("Error message:", error);
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Upload failed" });
    }
  }
};
