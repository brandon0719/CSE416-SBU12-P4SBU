import express from "express";
import { getUsers, deleteUser, getUnapprovedUsers, approveUser, getUserById } from "../controllers/adminControllers.js";
import { registerUser } from "../controllers/authControllers.js";

const router = express.Router();

router.get("/users", getUsers);
router.get("/unapprovedUsers", getUnapprovedUsers);
router.post("/approveUser", approveUser);
router.post("/createUser", registerUser);
router.post("/deleteUser", deleteUser);
router.get("/:id", getUserById);

export default router;
