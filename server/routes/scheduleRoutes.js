// Schedule Routes
// Weekly staff schedules and dynamic conflict-free available slots

import express from 'express';
import { getSchedules, getAvailableSlots, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getSchedules);
router.get('/available-slots', getAvailableSlots);

router.post('/', protect, authorizeRoles('Admin', 'Service Provider'), createSchedule);
router.put('/:id', protect, authorizeRoles('Admin', 'Service Provider'), updateSchedule);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteSchedule);

export default router;
