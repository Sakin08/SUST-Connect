import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  markInterested,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController.js";
import { protect, adminOnly } from "../middleware/index.js"; // Now valid
import { cacheMiddleware, CACHE_TTL } from "../services/cacheService.js";

const router = express.Router();

router.post("/", protect, createEvent); // Any logged-in user can create
router.get("/", cacheMiddleware(CACHE_TTL.SHORT), getEvents); // Cache for 2 minutes
router.get("/:id", cacheMiddleware(CACHE_TTL.MEDIUM), getEventById); // Cache for 5 minutes
router.patch("/:id/interested", protect, markInterested);
router.put("/:id", protect, updateEvent);
router.delete("/:id", protect, deleteEvent);
export default router;
