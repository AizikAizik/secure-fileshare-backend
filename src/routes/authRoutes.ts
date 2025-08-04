import { Router } from "express";
import { register, login, getMyPublicKey } from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/my-public-key", protect, getMyPublicKey);
export default router;
