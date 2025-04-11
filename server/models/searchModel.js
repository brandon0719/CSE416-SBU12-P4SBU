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

export const queryAllBuildings = async (query) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM buildings");
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
};

export const queryLots = async () => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM lots");
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
};
