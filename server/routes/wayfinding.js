// server/routes/wayfinding.js (ES Module version, for example)
import express from "express";
import { aStar, toOSRMResponse } from "../lib/aStar.js";
import { manhattan } from "../lib/heuristics.js";
import campusGraph from "../data/campusGraph.json" assert { type: "json" };

const router = express.Router();

function getClosestNode(graph, coord) {
    return Object.keys(graph)[0];
}

router.get("/route/v5/driving/:coords", (req, res) => {
    console.log("Received route request with coords:", req.params.coords);

    try {
        const coordsParam = req.params.coords; // e.g., "-73.12246,40.91671;-73.12150,40.91750"
        const [originStr, destStr] = coordsParam.split(";");
        if (!originStr || !destStr) {
            return res.status(400).json({ error: "Invalid coordinate format" });
        }
        const [originLng, originLat] = originStr.split(",").map(Number);
        const cleanedDestStr = destStr.replace(/\.json$/, "");
        const [destLng, destLat] = cleanedDestStr.split(",").map(part => Number(part.trim()));

        const originCoord = [originLng, originLat];
        const destCoord = [destLng, destLat];

        const startNode = getClosestNode(campusGraph, { x: originLng, y: originLat });
        const goalNode = getClosestNode(campusGraph, { x: destLng, y: destLat });


        const pathNodes = aStar(campusGraph, startNode, goalNode, { heuristic: manhattan });

        // Pass the original coordinates as fallback if the computed path is insufficient.
        const osrmResponse = toOSRMResponse(campusGraph, pathNodes, originCoord, destCoord);

        res.json(osrmResponse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
