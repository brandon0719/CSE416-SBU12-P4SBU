import express from "express";
import {
  getAllLotsController,
  addLotController,
  editLotController,
  removeLotController,
} from "../controllers/lotControllers.js";


const router = express.Router();

// Fetch all parking lots
router.get("/getlots", getAllLotsController);

// Add a new parking lot
router.post("/add", addLotController);

// Edit an existing parking lot
router.put("/edit/:id", editLotController);

// Remove a parking lot
router.delete("/delete/:id", removeLotController);

export default router;
