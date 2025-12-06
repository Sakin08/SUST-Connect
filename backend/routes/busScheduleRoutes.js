import express from "express";
import multer from "multer";
import { protect, adminOnly } from "../middleware/auth.js";
import {
  getActiveSchedule,
  uploadSchedule,
  deleteSchedule,
} from "../controllers/busScheduleController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Public route - anyone can view
router.get("/", getActiveSchedule);


router.post("/", protect, adminOnly, upload.array("images", 5), uploadSchedule);
router.delete("/:id", protect, adminOnly, deleteSchedule);

export default router;
