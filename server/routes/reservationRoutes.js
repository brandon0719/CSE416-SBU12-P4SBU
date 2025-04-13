import express from "express";
import { reserve, getReservations, getSortedReservations } from "../controllers/reservationControllers.js";

const router = express.Router();

router.get("/fetch", getReservations);
router.post("/create", reserve);
router.get("/user/:userId", getSortedReservations);

export default router;
