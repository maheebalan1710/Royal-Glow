// Service Routes
// CRUD operations for salon services

import express from 'express';
import { getServices, getServiceById, createService, updateService, deleteService } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:id', getServiceById);

router.post('/', protect, authorizeRoles('Admin'), createService);
router.put('/:id', protect, authorizeRoles('Admin'), updateService);
router.delete('/:id', protect, authorizeRoles('Admin'), deleteService);

export default router;
