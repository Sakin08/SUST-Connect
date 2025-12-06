import express from "express";
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
} from "../controllers/buySellController.js";
import { protect } from "../middleware/auth.js";
import { cacheMiddleware, CACHE_TTL } from "../services/cacheService.js";

const router = express.Router();

router.post("/", protect, createPost);
router.get("/", cacheMiddleware(CACHE_TTL.MEDIUM), getPosts); // Cache for 5 minutes
router.get("/:id", cacheMiddleware(CACHE_TTL.MEDIUM), getPost);
router.put("/:id", protect, updatePost);
router.delete("/:id", protect, deletePost);

export default router;
