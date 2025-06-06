import pool from "../config/db.js";

export const createMessage = async (senderId, recipientId, messageDetails) => {
    try {
        const { rows } = await pool.query(
            "INSERT INTO messages (sender_id, recipient_id, message_details) VALUES ($1, $2, $3) RETURNING *",
            [senderId, recipientId, messageDetails]
        );
        return rows[0];
    } catch (error) {
        throw new Error("Error creating message: " + error.message);
    }
};

export const getMessagesByRecipientId = async (recipientId) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM messages WHERE recipient_id = $1 ORDER BY time_sent DESC",
            [recipientId]
        );
        return rows;
    } catch (error) {
        throw new Error("Error fetching messages: " + error.message);
    }
};