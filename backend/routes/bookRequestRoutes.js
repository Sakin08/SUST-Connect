import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createBookRequest,
  getBookRequests,
  getBookRequest,
  updateBookRequest,
  updateStatus,
  deleteBookRequest,
  addResponse,
  deleteResponse,
  getUserBookRequests,
} from "../controllers/bookRequestController.js";

const router = express.Router();

// Public routes (no auth required for viewing)
router.get("/", getBookRequests);
router.get("/:id", getBookRequest);
router.get("/user/:userId", getUserBookRequests);

// Protected routes (auth required)
router.post("/", protect, createBookRequest);
router.put("/:id", protect, updateBookRequest);
router.patch("/:id/status", protect, updateStatus);
router.delete("/:id", protect, deleteBookRequest);

// Response routes (auth required)
router.post("/:id/responses", protect, addResponse);
router.delete("/:id/responses/:responseId", protect, deleteResponse);

export default router;
