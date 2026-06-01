import express from "express";
import { login, me } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/login — public
router.post("/login", login);

// GET /api/auth/me — protected (verify token + return admin info)
router.get("/me", protect, me);

export default router;