import express from "express";
import { getCapacityAnalysis, getCapacityUsage, getRevenueAnalysis, getDailyRevenueAnalysis, getTicketAnalysis, getReservationAnalysis, getDailyTicketAnalysis, getDailyReservationAnalysis, getUserTypeCounts, getDailyFeedbackCounts } from "../controllers/analysisControllers.js";

const router = express.Router();

// routes for all the analysis
router.get("/capacity", getCapacityAnalysis);
router.get("/capacity-usage", getCapacityUsage);

router.get("/revenue", getRevenueAnalysis);
router.get("/daily-revenue", getDailyRevenueAnalysis);

router.get("/tickets", getTicketAnalysis);
router.get("/daily-tickets", getDailyTicketAnalysis);

router.get("/reservations", getReservationAnalysis);
router.get("/daily-reservations", getDailyReservationAnalysis);

router.get("/user-type-counts", getUserTypeCounts);
router.get("/daily-feedback-counts", getDailyFeedbackCounts);

export default router;