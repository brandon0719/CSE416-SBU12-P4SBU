import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import lotsRouter from "./routes/lots.js";
import reservationRoutes from "./routes/reservationRoutes.js"
import wayfindingRoutes from "./routes/wayfinding.js";

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/lots", lotsRouter);
app.use("/api/reservation", reservationRoutes);
app.use('/', wayfindingRoutes);


export default app;