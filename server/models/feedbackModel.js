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

export const getAllFeedback = async () => {
    try {
        const { rows } = await pool.query("SELECT * FROM feedback ORDER BY creation_date DESC");
        return rows;
    } catch (error) {
        console.error("Error fetching feedback:", error);
        throw new Error("Error fetching feedback: " + error.message);
    }
}

export const getFeedbackList = async () => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                feedback.feedback_id, 
                feedback.topic, 
                feedback.creation_date, 
                feedback.resolved, 
                users.name, 
                users.user_type 
            FROM feedback
            JOIN users ON feedback.user_id = users.user_id
            ORDER BY feedback.creation_date DESC`
        );
        return rows;
    } catch (error) {
        throw new Error("Error fetching feedback list: " + error.message);
    }
};

export const getFeedbackDetails = async (feedbackId) => {
    try {
        const { rows } = await pool.query(
            `SELECT 
                feedback.feedback_id, 
                feedback.topic, 
                feedback.creation_date, 
                feedback.resolved, 
                users.name, 
                users.user_type, 
                feedback.details 
            FROM feedback
            JOIN users ON feedback.user_id = users.user_id
            WHERE feedback.feedback_id = $1`,
            [feedbackId]
        );
        return rows[0];
    } catch (error) {
        throw new Error("Error fetching feedback details: " + error.message);
    }
};

export const resolveFeedback = async (feedbackId) => {
    try {
        await pool.query(
            "UPDATE feedback SET resolved = TRUE WHERE feedback_id = $1",
            [feedbackId]
        );
    } catch (error) {
        throw new Error("Error resolving feedback: " + error.message);
    }
};