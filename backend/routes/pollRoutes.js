import express from "express";
import * as pollController from "../controllers/pollController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes (with optional auth)
router.get("/", protect, pollController.getAllPolls);
router.get("/:id", protect, pollController.getPollById);
router.get("/:id/results", pollController.getPollResults);

// Protected routes
router.post("/", protect, pollController.createPoll);
router.post("/:pollId/vote", protect, pollController.submitVote);
router.put("/:id", protect, pollController.updatePoll);
router.delete("/:id", protect, pollController.deletePoll);

// Super admin only
router.get("/:pollId/voters", protect, pollController.getVoterDetails);

export default router;
