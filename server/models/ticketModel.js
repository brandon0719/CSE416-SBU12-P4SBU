import pool from "../config/db.js";

export const createTicket = async (userId, violationDate, ticketPrice, ticketDetails) => {
    try {
        const { rows } = await pool.query(
            "INSERT INTO tickets (user_id, violation_date, ticket_price, ticket_details, creation_date) VALUES ($1, $2, $3, $4, NOW()) RETURNING *",
            [userId, violationDate, ticketPrice, ticketDetails]
        );
        console.log("Ticket created");
        return rows[0];
    } catch (error) {
        throw new Error(error.message);
    }
}

export const getTicketsForUser = async (userId) => {
    try {
        const { rows } = await pool.query(
            "SELECT * FROM tickets WHERE user_id=$1 AND paid=false ORDER BY creation_date ASC",
            [userId]
        );
        return rows;

    } catch (error) {
        console.error("Error fetching tickets:", error.message); 
        throw new Error(error.message);
    }
}

export const markTicketsPaid = async (ticketIds) => {
    try {
        const { rows } = await pool.query(
            "UPDATE tickets SET paid = true WHERE ticket_id = ANY($1::int[]) RETURNING *",
            [ticketIds]
        );
        return rows;
    } catch (error) {
        console.error("Error marking tickets as paid:", error.message); 

    }
}

export const getPaidTicketsByUserId = async (userId) => {
    try {
        console.log("Fetching paid tickets for user:", userId);
        const { rows } = await pool.query(
            "SELECT * FROM tickets WHERE user_id=$1 AND paid=true ORDER BY creation_date ASC",
            [userId]
        );
        return rows;
    } catch (error) {
        console.error("Error fetching paid tickets:", error.message); 
        throw new Error(error.message);
    }
}