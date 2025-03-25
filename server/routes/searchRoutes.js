import express from "express";
import { searchBuildings, getLots } from "../controllers/searchControllers.js";

const router = express.Router();

router.get("/buildings", searchBuildings);
router.get("/lots", getLots);

export default router;
