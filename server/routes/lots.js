import express from "express";
import pool from "../tests/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { sortBy, userLng, userLat } = req.query;

  // HAVE TO ADD SORTING LATER
    // let orderByClause = "";
    // if (sortBy === "distance" && userLng && userLat) {
    //     orderByClause = `
    //         ORDER BY ST_Distance(
    //             geom::geography,
    //             ST_SetSRID(ST_MakePoint(${userLng}, ${userLat}), 4326)::geography
    //         )
    //     `;
    // } else if (sortBy === "price") {
    //     orderByClause = "ORDER BY price";
    // }
    try {
        const result = await pool.query(`
      SELECT 
        name,
        total_spaces,
        details,
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
