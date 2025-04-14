import express from "express";
import { handleCreateFeedback } from "../controllers/feedbackControllers.js";

const router = express.Router();

// Route to create feedback
router.post("/create", handleCreateFeedback);

export default router;