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

// For profilepage (Gets past and active reservations for the user)
export const getReservationsByUser = async (userId) => {
    try {
        // Current reservations: end_time is in the future or now
        const currentQuery = `
            SELECT *
            FROM reservations 
            WHERE user_id = $1 AND end_time >= NOW()
            ORDER BY start_time;
        `;
        // Past reservations: end_time is in the past
        const pastQuery = `
            SELECT *
            FROM reservations 
            WHERE user_id = $1 AND end_time < NOW()
            ORDER BY start_time DESC;
        `;

        const currentRes = await pool.query(currentQuery, [userId]);
        const pastRes = await pool.query(pastQuery, [userId]);

        return {
            currentReservations: currentRes.rows,
            pastReservations: pastRes.rows,
        };
    } catch (error) {
        throw new Error(error.message);
    }
};