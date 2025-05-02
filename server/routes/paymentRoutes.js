import express from "express";
import { createPaymentIntent } from "../controllers/paymentControllers.js";

const router = express.Router();

// Create a new PaymentIntent
router.post("/create-payment-intent", createPaymentIntent);

export default router;
