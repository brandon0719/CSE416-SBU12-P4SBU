import { queryBuildings } from "../models/searchModel.js";

// building search
export const searchBuildings = async (req, res) => {
    const { query } = req.body;

    try {
        const searchResults = await queryBuildings(query);
        res.status(200).json({
            searchResults: searchResults,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};