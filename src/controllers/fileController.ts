import { Request, Response } from "express";
import multer from "multer";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import File, { IFile } from "../models/File";
import dotenv from "dotenv";
import User, { IUser } from "../models/User";
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

// Download
export const downloadFile = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const { fileId }: { fileId?: string } = req.params;

  try {
    const file: IFile | null = await File.findById(fileId);
    if (
      !file ||
      (file.owner.toString() !== req.user?.id &&
        !file.shareList.some((s) => s.userId.toString() === req.user?.id))
    ) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME as string,
      Key: file.s3Key,
    });
    const url: string = await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour

    const userEncryptedKey: string =
      file.owner.toString() === req.user?.id
        ? file.encryptedKey
        : file.shareList.find((s) => s.userId.toString() === req.user?.id)
            ?.encryptedKey || "";

    res.json({ downloadUrl: url, encryptedKey: userEncryptedKey });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Download error:", error);
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: "Download failed" });
  }
};

// Share
export const shareFile = async (
  req: Request & { user?: { id: string } },
  res: Response
): Promise<void> => {
  const {
    fileId,
    recipientEmail,
    encryptedKeyForRecipient,
  }: {
    fileId: string;
    recipientEmail: string;
    encryptedKeyForRecipient: string;
  } = req.body;

  try {
    const file: IFile | null = await File.findById(fileId);
    if (!file || file.owner.toString() !== req.user?.id) {
      res.status(403).json({ error: "Unauthorized" });
      return;
    }

    const recipient: IUser | null = await User.findOne({
      email: recipientEmail,
    });
    if (!recipient) {
      res.status(404).json({ error: "Recipient not found" });
      return;
    }

    file.shareList.push({
      userId: recipient._id,
      encryptedKey: encryptedKeyForRecipient,
    });
    await file.save();

    res.json({ message: "File shared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Sharing failed" });
  }
};
