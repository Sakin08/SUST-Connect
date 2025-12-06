import express from "express";
import * as electionController from "../controllers/electionController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", electionController.getElections);
router.get("/:electionId/results", electionController.getResults);

// Protected routes (logged in users)
router.get("/my/eligible", protect, electionController.getMyElections);
router.get("/:id", protect, electionController.getElectionById);
router.post("/vote", protect, electionController.castVote);
router.post("/request-candidacy", protect, electionController.requestCandidacy);
router.get(
  "/my/candidacy-requests",
  protect,
  electionController.getMyCandidacyRequests
);

// Admin routes
router.post("/", protect, adminOnly, electionController.createElection);
router.put("/:id", protect, adminOnly, electionController.updateElection);
router.delete("/:id", protect, adminOnly, electionController.deleteElection);
router.post(
  "/:electionId/positions",
  protect,
  adminOnly,
  electionController.addPosition
);
router.post("/candidates", protect, adminOnly, electionController.addCandidate);
router.get(
  "/:electionId/candidates/pending",
  protect,
  adminOnly,
  electionController.getPendingCandidates
);
router.get(
  "/:electionId/candidates/all",
  protect,
  adminOnly,
  electionController.getAllCandidates
);
router.put(
  "/candidates/:candidateId/approve",
  protect,
  adminOnly,
  electionController.approveCandidateRequest
);
router.put(
  "/candidates/:candidateId/reject",
  protect,
  adminOnly,
  electionController.rejectCandidateRequest
);
router.post(
  "/:electionId/publish-results",
  protect,
  adminOnly,
  electionController.publishResults
);

export default router;
