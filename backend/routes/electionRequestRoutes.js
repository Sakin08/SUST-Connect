import express from "express";
import * as electionRequestController from "../controllers/electionRequestController.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// Protected routes (logged in users)
router.post("/", protect, electionRequestController.createRequest);
router.get("/my", protect, electionRequestController.getMyRequests);

// Admin routes
router.get("/", protect, adminOnly, electionRequestController.getAllRequests);
router.get("/:id", protect, electionRequestController.getRequestById);
router.post(
  "/:id/approve",
  protect,
  adminOnly,
  electionRequestController.approveRequest
);
router.post(
  "/:id/reject",
  protect,
  adminOnly,
  electionRequestController.rejectRequest
);
router.put(
  "/:id/status",
  protect,
  adminOnly,
  electionRequestController.updateRequestStatus
);
router.delete("/:id", protect, electionRequestController.deleteRequest);

export default router;
