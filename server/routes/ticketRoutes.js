import express from 'express';
import { handleCreateTicket, getTicketsByUserId, markTicketsAsPaid, getPaidTickets }  from '../controllers/ticketControllers.js';

const router = express.Router();

// endpoint to create a ticket
router.post("/create", handleCreateTicket);

// endpoint to mark tickets as paid
router.post("/pay", markTicketsAsPaid);

// endpoint to get tickets by user id
router.get("/user/:userId", getTicketsByUserId);

router.get("/user/:userId/paid", getPaidTickets);
export default router;