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
import paymentRoutes from "./routes/paymentRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import messageRoutes from "./routes/messagesRoutes.js";



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
app.use("/api/buildings", buildingRouter);
app.use("/api/user", userRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/payments", paymentRoutes)
app.use("/api/analysis", analysisRoutes);
app.use("/api/messages", messageRoutes);

// Heroku 
import path from "path";
// 1. Serve static assets from client/dist
const __dirname = path.resolve();  
app.use(express.static(path.join(__dirname, "client", "dist")));

// 2. Any other GET, send back index.html so React Router can handle it
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

export default app;