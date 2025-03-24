import pool from "../config/db.js";

export const queryBuildings = async (query) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM buildings WHERE name ilike ('%' || $1 || '%')", 
            [query]);
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
};
