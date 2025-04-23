import pool from "../config/db.js";

export const createReservation = async (userId, parkingLot, startTime, endTime, numSpots, explanation) => {
    try {
        const overlappingReservations = await getOverlappingReservations(parkingLot, startTime, endTime);
        const lotCapacity = await getLotCapacity(parkingLot);
        if (overlappingReservations.length + numSpots > lotCapacity) { //this logic needs fixing - needs to add up the total number of spots taken by reservations since they can be greater than 1
            throw new Error("Not enough spaces in parking lot for reservation");
        } else {
            const { rows } = await pool.query(
                "INSERT INTO reservations (user_id, lot_name, start_time, end_time, num_spots, explanation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [userId, parkingLot, startTime, endTime, numSpots, explanation]
            );
            return rows[0];
        }

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
        return rows;
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

export const getLotReservations = async (lot) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM reservations WHERE lot_name=$1",
            [lot]
        );
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getOverlappingReservations = async (lot, startTime, endTime) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM reservations WHERE lot_name=$1 AND (start_time < ($3) AND end_time > ($2))",
            [lot, startTime, endTime]
        );
        return rows;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getLotCapacity = async (lot) => {
    try {
        const { rows } = await pool.query(
            "SELECT total_spaces FROM lots WHERE name = $1",
            [lot]
        );
        return rows[0].total_spaces;
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getNumAvailableSpotsAtTime = async (parkingLot, startTime, endTime) => {
    try {
        const overlappingReservations = await getOverlappingReservations(parkingLot, startTime, endTime);
        const lotCapacity = await getLotCapacity(parkingLot);
        return lotCapacity - overlappingReservations.length;
    } catch (error) {
        throw new Error(error.message)
    }
}