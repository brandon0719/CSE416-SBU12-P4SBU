import express from "express";
import { reserve, getReservations, getSortedReservations, getReservationsByLot, getReservationsByLotAndTime, getNumAvailableAtTime } from "../controllers/reservationControllers.js";

const router = express.Router();

router.get("/fetch", getReservations);
router.post("/create", reserve);
router.get("/user/:userId", getSortedReservations);
router.get("/lot", getReservationsByLot)
router.get("/lot/num", getNumAvailableAtTime)

export default router;
