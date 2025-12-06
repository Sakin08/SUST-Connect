import express from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getActiveSchedule,
  uploadSchedule,
  deleteSchedule,
} from "../controllers/busScheduleController.js";
import { cacheMiddleware, CACHE_TTL } from "../services/cacheService.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public route - anyone can view
router.get("/", cacheMiddleware(CACHE_TTL.LONG), getActiveSchedule); // Cache for 1 hour

// Admin only routes
router.post("/", protect, adminOnly, upload.array("images", 5), uploadSchedule);
router.delete("/:id", protect, adminOnly, deleteSchedule);

export default router;
