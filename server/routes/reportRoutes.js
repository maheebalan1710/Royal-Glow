// Report Routes
// Requirement 8: Summary metrics and business analytics

import express from 'express';
import { getDashboardReports } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/dashboard', authorizeRoles('Admin', 'Receptionist'), getDashboardReports);

export default router;
