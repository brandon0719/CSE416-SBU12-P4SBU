import express from "express";
import pool from "../tests/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        name,
        ST_AsGeoJSON(geom)::json AS geom 
      FROM lots
    `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching lots:", error);
        res.status(500).send("Server error");
    }
});

export default router;
