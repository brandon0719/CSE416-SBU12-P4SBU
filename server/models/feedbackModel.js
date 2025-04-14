import pool from "../config/db.js";

export const createFeedback = async (userId, topic, details) =>{
    try {
        const { rows } = await pool.query(
            "INSERT INTO feedback (user_id, topic, details) VALUES ($1, $2, $3) RETURNING *",
            [userId, topic, details]
        )
        return rows[0];
    } catch (error) {
        console.error("Error creating feedback:", error);
        throw new Error("Error creating feedback: " + error.message);
    }
}