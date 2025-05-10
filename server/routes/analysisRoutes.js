import express from "express";
import { getCapacityAnalysis, getRevenueAnalysis, getTicketAnalysis, getReservationAnalysis, getCapacityUsage } from "../controllers/analysisControllers.js";

const router = express.Router();

router.get("/capacity", getCapacityAnalysis);

router.get("/capacity-usage", getCapacityUsage);

router.get("/revenue", getRevenueAnalysis);

router.get("/tickets", getTicketAnalysis);

router.get("/reservations", getReservationAnalysis);

export default router;