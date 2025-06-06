import express from "express";
import {
  getAllLotsController,
  addLotController,
  editLotController,
  removeLotController,
  getLotDetailsController,
} from "../controllers/lotControllers.js";


const router = express.Router();

// Fetch all parking lots
router.get("/getlots", getAllLotsController);

// Fetch details of all parking lots
router.get("/getlotdetails", getLotDetailsController);

// Add a new parking lot
router.post("/add", addLotController);

// Edit an existing parking lot
router.put("/edit/:id", editLotController);

// Remove a parking lot
router.delete("/delete/:id", removeLotController);

export default router;
