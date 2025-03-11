import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/auth/register", registerUser);
router.post("/auth/login", loginUser);
router.get("/auth/protected", authMiddleware, (req, res) => {
    res.json({ message: "You are authorized!", user: req.user });
});

export default router;
