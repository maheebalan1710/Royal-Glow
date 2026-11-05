// Staff Profile Routes
// CRUD operations for staff profiles

import express from 'express';
import { getStaffProfiles, getStaffById, createStaffProfile, updateStaffProfile, deleteStaffProfile } from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getStaffProfiles);
router.get('/:id', getStaffById);

router.post('/', protect, authorizeRoles('Admin'), createStaffProfile);
router.put('/:id', protect, authorizeRoles('Admin', 'Service Provider'), updateStaffProfile);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteStaffProfile);

export default router;
