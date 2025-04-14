import {getAllLots, getLotDetails, addLot, editLot, removeLot} from "../models/lotModel.js";


// Fetch all parking lots
export const getAllLotsController = async (req, res) => {
    try {
        const lots = await getAllLots();
        res.status(200).json(lots);
    } catch (error) {
        console.error("Error fetching parking lots:", error.message);
        res.status(500).json({ error: "Failed to fetch parking lots" });
    }
};

export const getLotDetailsController = async (req, res) => {
    try {
        const lots = await getLotDetails();
        res.status(200).json(lots);
    } catch (error) {
        console.error("Error fetching lot details:", error.message);
        res.status(500).json({ error: "Failed to fetch lot details" });
    }
};


// Add a new parking lot
export const addLotController = async (req, res) => {
    try {
        console.log(req.body, "still here");
        const newLot = await addLot(req.body);
        res.status(201).json(newLot);
    } catch (error) {
        console.error("Error adding parking lot:", error.message);
        res.status(500).json({ error: "Failed to add parking lot" });
    }
};

export const editLotController = async (req, res) => {
    try {
        const updatedLot = await editLot(req.params.id, req.body);
        res.status(200).json(updatedLot);
    } catch (error) {
        console.error("Error editing parking lot:", error.message);
        res.status(500).json({ error: "Failed to edit parking lot" });
    }
};

export const removeLotController = async (req, res) => {
    try {
        const deletedLot = await removeLot(req.params.id);
        res.status(200).json(deletedLot);
    } catch (error) {
        console.error("Error removing parking lot:", error.message);
        res.status(500).json({ error: "Failed to remove parking lot" });
    }
};