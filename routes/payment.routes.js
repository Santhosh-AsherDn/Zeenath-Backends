import express from 'express';
import { createOrder, verifyPayment } from '../controllers/payment.controller.js';

const router = express.Router();

router.post("/create-order", createOrder);
router.post("/payment-success", verifyPayment);

export default router;