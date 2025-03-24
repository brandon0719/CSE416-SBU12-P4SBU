import express from "express";
import { searchBuildings } from "../controllers/searchControllers.js";

const router = express.Router();

router.get("/buildings", searchBuildings);

export default router;
