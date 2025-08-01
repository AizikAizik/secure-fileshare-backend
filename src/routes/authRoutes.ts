import { Router } from "express";
import { register, login, getPublicKey } from "../controllers/authController";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/public-key", getPublicKey);

export default router;
