import { queryBuildings, queryLots } from "../models/searchModel.js";

// building search
export const searchBuildings = async (req, res) => {
    const { q } = req.query;

    try {
        const searchResults = await queryBuildings(q);
        res.status(200).json({
            searchResults: searchResults,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// return lots
export const getLots = async (req, res) => {
    try {
        const results = await queryLots();
        res.status(200).json({
            lots: results,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};