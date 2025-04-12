import express from "express";
import { updateProfile } from "../controllers/userControllers.js";

const router = express.Router();

router.put("/profile", updateProfile);
export default router;
