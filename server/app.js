import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import lotsRoutes from "./routes/lotsRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js"
import ticketRoutes from "./routes/ticketRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js";
import buildingRouter from "./routes/buildings.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";



const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/lots", lotsRoutes);
app.use("/api/reservation", reservationRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/buildings", buildingRouter);app.use("/api/user", userRoutes)
app.use("/api/feedback", feedbackRoutes);

// Heroku 
import path from "path";
import { fileURLToPath } from "url";

// Support __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from client build
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../client/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../client/build/index.html"));
    });
}

export default app;