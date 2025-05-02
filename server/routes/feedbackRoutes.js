import express from "express";
import { handleCreateFeedback, handleGetAllFeedback } from "../controllers/feedbackControllers.js";

const router = express.Router();

// Route to create feedback
router.post("/create", handleCreateFeedback);

router.get("/all", handleGetAllFeedback);

export default router;