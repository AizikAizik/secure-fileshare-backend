import { Router } from "express";
import {
  uploadFile,
  shareFile,
  downloadFile,
  listFiles,
} from "../controllers/fileController";
import { protect } from "../middleware/authMiddleware";
import multer from "multer";

const uploadMiddleware = multer({ storage: multer.memoryStorage() }).single(
  "file"
);

const router: Router = Router();

router.post("/upload", protect, uploadMiddleware, uploadFile);
router.get("/download/:fileId", protect, downloadFile);
router.post("/share", protect, shareFile);
router.get("/list", protect, listFiles);

export default router;
