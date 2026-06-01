import express from "express";
import {
    submitSurvey,
    getAllFeedback,
    getFeedbackById,
    deleteFeedback,
    getStats,
} from "../controllers/feedbackController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/feedback/submit — public (called by Form.jsx on submission)
router.post("/submit", submitSurvey);

// GET /api/feedback/stats — protected (dashboard summary cards)
router.get("/stats", protect, getStats);

// GET /api/feedback — protected (paginated table with filters)
router.get("/", protect, getAllFeedback);

// GET /api/feedback/:id — protected (single record detail)
router.get("/:id", protect, getFeedbackById);

// DELETE /api/feedback/:id — protected (admin delete)
router.delete("/:id", protect, deleteFeedback);

export default router;