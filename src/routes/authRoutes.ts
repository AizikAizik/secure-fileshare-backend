import { Router } from "express";
import {
  register,
  login,
  getMyPublicKey,
  getPublicKey,
  getCsrfToken,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/my-public-key", protect, getMyPublicKey);
router.get("/public-key", getPublicKey); // No protect middleware, as it's for sharing
router.get("/csrf", getCsrfToken); // Unprotected endpoint to get token

export default router;
