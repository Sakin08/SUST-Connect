import express from "express";
import {
  submitContactForm,
  getAllContacts,
  updateContactStatus,
  deleteContact,
} from "../controllers/contactController.js";
import { protect } from "../middleware/auth.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public route - anyone can submit
router.post("/", submitContactForm);

// Admin routes
router.get("/", protect, adminOnly, getAllContacts);
router.patch("/:id/status", protect, adminOnly, updateContactStatus);
router.delete("/:id", protect, adminOnly, deleteContact);

export default router;
