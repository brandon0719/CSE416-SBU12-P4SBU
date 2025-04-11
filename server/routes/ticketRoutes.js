import express from 'express';
import { handleCreateTicket, getTicketsByUserId, markTicketsAsPaid }  from '../controllers/ticketControllers.js';
import { getAllUsers } from '../controllers/userController.js';

const router = express.Router();

// endpoint to create a ticket
router.post("/create", handleCreateTicket);

// endpoint to mark tickets as paid
router.post("/pay", markTicketsAsPaid);

// endpoint to get all users
router.get("/users", getAllUsers);

// endpoint to get tickets by user id
router.get("/user/:userId", getTicketsByUserId);
export default router;