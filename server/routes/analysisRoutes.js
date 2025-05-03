import express from "express";
import { getCapacityAnalysis, getRevenueAnalysis, getUserAnalysis } from "../controllers/analysisControllers.js";

const router = express.Router();

router.get("/capacity", getCapacityAnalysis);

router.get("/revenue", getRevenueAnalysis);

router.get("/user", getUserAnalysis);

export default router;