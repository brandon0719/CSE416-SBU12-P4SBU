import express from "express";
import { handleCreateFeedback, handleGetAllFeedback, handleGetFeedbackList, handleGetFeedbackDetails, handleResolveFeedback, handleSendMessage } from "../controllers/feedbackControllers.js";

const router = express.Router();

// Route to create feedback
router.post("/create", handleCreateFeedback);

router.get("/all", handleGetAllFeedback);

router.get("/list", handleGetFeedbackList);

router.get("/:id", handleGetFeedbackDetails);

router.post("/resolve", handleResolveFeedback);

router.post("/message", handleSendMessage);

export default router;