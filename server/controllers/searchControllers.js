import { queryBuildings } from "../models/searchModel.js";

// building search
export const searchBuildings = async (req, res) => {
    const { q } = req.query;
    console.log(q);

    try {
        const searchResults = await queryBuildings(q);
        res.status(200).json({
            searchResults: searchResults,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};