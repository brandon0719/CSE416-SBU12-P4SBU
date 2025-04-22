import express from "express";
import { reserve, getReservations, getSortedReservations, getReservationsByLot } from "../controllers/reservationControllers.js";

const router = express.Router();

router.get("/fetch", getReservations);
router.post("/create", reserve);
router.get("/user/:userId", getSortedReservations);
router.get("/lot", getReservationsByLot)

export default router;
