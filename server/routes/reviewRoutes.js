// Review Routes
// Customer feedback and ratings

import express from 'express';
import { getReviews, createReview } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getReviews);
router.post('/', protect, authorizeRoles('Customer', 'Admin'), createReview);

export default router;
