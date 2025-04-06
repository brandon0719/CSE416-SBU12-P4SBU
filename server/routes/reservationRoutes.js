import express from "express";
import { reserve, getReservations } from "../controllers/reservationControllers.js";

const router = express.Router();

router.get("/fetch", getReservations);
router.post("/create", reserve);

export default router;
