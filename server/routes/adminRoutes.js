import express from "express";
import { getUsers, deleteUser, getUnapprovedUsers, approveUser } from "../controllers/adminControllers.js";
import { registerUser } from "../controllers/authControllers.js";
import { approveReservation } from "../controllers/reservationControllers.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/unapprovedUsers", getUnapprovedUsers);
router.post("/approveUser", approveUser);
router.post("/createUser", registerUser);
router.post("/deleteUser", deleteUser);
router.post("/approveReservation", approveReservation);

export default router;
