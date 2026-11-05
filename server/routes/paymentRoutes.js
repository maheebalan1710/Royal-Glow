// Payment Routes
// Billing and transaction records

import express from 'express';
import { getPayments, recordPayment, getPaymentById } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayments);
router.get('/:id', getPaymentById);
router.post('/', recordPayment);

export default router;
