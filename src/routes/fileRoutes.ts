import { Router } from "express";
import { uploadFile } from "../controllers/fileController";
import { protect } from "../middleware/authMiddleware";
import multer from "multer";

const uploadMiddleware = multer({ storage: multer.memoryStorage() }).single(
  "file"
);

const router: Router = Router();

router.post("/upload", protect, uploadMiddleware, uploadFile);

export default router;
