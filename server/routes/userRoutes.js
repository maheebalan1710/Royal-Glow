// User Routes
// CRUD operations for users

import express from 'express';
import { getUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', authorizeRoles('Admin', 'Receptionist'), getUsers);
router.get('/:id', getUserById);
router.post('/', authorizeRoles('Admin'), createUser);
router.put('/:id', authorizeRoles('Admin'), updateUser);
router.delete('/:id', authorizeRoles('Admin'), deleteUser);

export default router;
