import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createUser, findUserByEmail } from "../models/userModel.js";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// User Registration
export const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await findUserByEmail(email);
        if (existingUser)
            return res.status(409).json({ error: "User already exists" });

        const newUser = await createUser(name, email, password);
        res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// User Login
export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await findUserByEmail(email);
        if (!user)
            return res.status(401).json({ error: "Invalid credentials" });

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch)
            return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
