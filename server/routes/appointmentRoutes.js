// Appointment Routes
// Booking, conflict detection, status progression, cancellation

import express from 'express';
import { 
  getAppointments, 
  getAppointmentById, 
  createAppointment, 
  updateAppointmentStatus, 
  updateAppointment, 
  deleteAppointment 
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getAppointments);
router.get('/:id', getAppointmentById);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);
router.put('/:id', authorizeRoles('Admin', 'Receptionist'), updateAppointment);
router.delete('/:id', authorizeRoles('Admin'), deleteAppointment);

export default router;
