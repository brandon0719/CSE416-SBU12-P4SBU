import { createTicket, getTicketsForUser, markTicketsPaid, getPaidTicketsByUserId } from "../models/ticketModel.js";

export const handleCreateTicket = async (req, res) => {
    console.log("we made it here, this shoes it crashes 1 line after"); 
    const { userId, violationDate, ticketPrice, ticketDetails } = req.body;
    console.log("Request Body:", req.body); 
    console.log(userId, violationDate, ticketPrice, ticketDetails); // Debugging line
    try {
        const newTicket = await createTicket(userId, violationDate, ticketPrice, ticketDetails);
        res.status(200).json(newTicket);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export const getTicketsByUserId = async (req, res) => {
    const { userId } = req.params;
    try{
        const tickets = await getTicketsForUser(userId);
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error.message);
        res.status(500).json({ error: error.message });
    }
}

export const markTicketsAsPaid = async (req, res) => {
    const { ticketIds } = req.body;
    try {
        const updatedTickets = await markTicketsPaid(ticketIds);
        res.status(200).json(updatedTickets);
    } catch (error) {
        console.error("Error marking tickets as paid:", error.message); 
        res.status(500).json({ error: error.message });
    }
}

export const getPaidTickets = async (req, res) =>{
    const { userId } = req.params;
    try {
        const tickets = await getPaidTicketsByUserId(userId);
        res.status(200).json(tickets);
    } catch (error) {
        console.error("Error fetching paid tickets:", error.message); 
        res.status(500).json({ error: error.message });
    }
}