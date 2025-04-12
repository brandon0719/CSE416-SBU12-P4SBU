import express from "express";
import pool from "../tests/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id,
                name,
                ST_AsGeoJSON(location)::json AS location
            FROM campus_buildings
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching buildings:", error);
        res.status(500).send("Server error");
    }
});

export default router;
