import express from "express";

import { handleGetMessages, handleSendMessage } from "../controllers/messageControllers.js";

const router = express.Router();

router.get("/:userId", handleGetMessages);

router.post("/send", handleSendMessage);

export default router;