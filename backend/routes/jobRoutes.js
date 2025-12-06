import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createJob,
  getJobs,
  getJobById,
  applyToJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { cacheMiddleware, CACHE_TTL } from "../services/cacheService.js";

const router = express.Router();

router.post("/", protect, createJob);
router.get("/", cacheMiddleware(CACHE_TTL.MEDIUM), getJobs); // Cache for 5 minutes
router.get("/:id", cacheMiddleware(CACHE_TTL.MEDIUM), getJobById);
router.post("/:id/apply", protect, applyToJob);
router.put("/:id", protect, updateJob);
router.delete("/:id", protect, deleteJob);

export default router;
