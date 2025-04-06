import pool from "../config/db.js";

export const createReservation = async (userId, parkingLot, startTime, endTime) => {
    try {
        const { rows } = await pool.query(
            "INSERT INTO reservations (user_id, lot_name, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *",
            [userId, parkingLot, startTime, endTime]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
};

export const getUserReservations = async (userId) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM reservations WHERE user_id=$1",
            [userId]
        );
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
}