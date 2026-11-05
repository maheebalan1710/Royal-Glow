// Appointment Controller
// Core Workflow: Booking, conflict prevention, status management, search & filters
// College Internal Project: Project 21

import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Get appointments with role-based filtering, status filter, search & pagination
// @route   GET /api/appointments
// @access  Private
export const getAppointments = async (req, res) => {
  try {
    const { status, date, search, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (date) filter.date = date;
    if (search) filter.search = search;

    // Role-based visibility scoping
    if (req.user.role === 'Customer') {
      filter.customer = req.user._id;
    } else if (req.user.role === 'Service Provider') {
      filter.staff = req.user._id;
    }
    // Admin and Receptionist can see all appointments

    const appointments = await Appointment.find(filter);

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = appointments.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total: appointments.length,
      currentPage: pageNum,
      totalPages: Math.ceil(appointments.length / limitNum) || 1,
      appointments: paginated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
export const getAppointmentById = async (req, res) => {
  try {
    const apt = await Appointment.findById(req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Role check
    if (req.user.role === 'Customer' && apt.customer._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }
    if (req.user.role === 'Service Provider' && apt.staff._id !== req.user._id) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to this booking.' });
    }

    return res.status(200).json({ success: true, appointment: apt });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Book a new appointment (Customer, Receptionist, Admin)
// @route   POST /api/appointments
// @access  Private
export const createAppointment = async (req, res) => {
  try {
    const { serviceId, staffId, appointmentDate, timeSlot, notes, customerId } = req.body;

    // 1. Validation in Express API
    if (!serviceId || !staffId || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: service, staff, date, and time slot.'
      });
    }

    // 2. Fetch service to calculate price and duration
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Selected service does not exist.' });
    }

    // Determine target customer (if Receptionist/Admin booking for someone, or current Customer)
    let finalCustomerId = req.user._id;
    if ((req.user.role === 'Admin' || req.user.role === 'Receptionist') && customerId) {
      finalCustomerId = customerId;
    }

    // 3. Time Conflict Prevention: Check if staff is already booked for this slot
    const hasConflict = await Appointment.checkConflict({
      staffId,
      appointmentDate,
      timeSlot
    });

    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: `Conflict detected: The selected specialist is already booked on ${appointmentDate} at ${timeSlot}. Please select a different time slot or specialist.`
      });
    }

    // 4. Create appointment record
    const newAppointment = await Appointment.create({
      customer: finalCustomerId,
      service: serviceId,
      staff: staffId,
      appointmentDate,
      timeSlot,
      durationMinutes: service.durationMinutes,
      status: req.user.role === 'Customer' ? 'Pending' : 'Confirmed',
      notes: notes || '',
      totalAmount: service.price
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      appointment: newAppointment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment status (Service Provider, Receptionist, Admin)
// @route   PATCH /api/appointments/:id/status
// @access  Private
export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const apt = await Appointment.findById(req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Customer can only cancel their own pending/confirmed appointment
    if (req.user.role === 'Customer') {
      if (apt.customer._id !== req.user._id) {
        return res.status(403).json({ success: false, message: 'Unauthorized.' });
      }
      if (status !== 'Cancelled') {
        return res.status(403).json({ success: false, message: 'Customers can only cancel appointments.' });
      }
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, { status });

    return res.status(200).json({
      success: true,
      message: `Appointment status updated to '${status}'.`,
      appointment: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update appointment details (Admin, Receptionist)
// @route   PUT /api/appointments/:id
// @access  Private (Admin, Receptionist)
export const updateAppointment = async (req, res) => {
  try {
    const { staffId, appointmentDate, timeSlot, status, notes } = req.body;

    const apt = await Appointment.findById(req.params.id);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // If changing time or staff, check for conflict
    const targetStaff = staffId || apt.staff._id;
    const targetDate = appointmentDate || apt.appointmentDate;
    const targetSlot = timeSlot || apt.timeSlot;

    if (staffId || appointmentDate || timeSlot) {
      const hasConflict = await Appointment.checkConflict({
        staffId: targetStaff,
        appointmentDate: targetDate,
        timeSlot: targetSlot,
        excludeAppointmentId: apt._id
      });

      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: `Cannot reschedule: The specialist already has a booking at ${targetSlot} on ${targetDate}.`
        });
      }
    }

    const updates = {};
    if (staffId) updates.staff = staffId;
    if (appointmentDate) updates.appointmentDate = appointmentDate;
    if (timeSlot) updates.timeSlot = timeSlot;
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;

    const updated = await Appointment.findByIdAndUpdate(req.params.id, updates);
    return res.status(200).json({
      success: true,
      message: 'Appointment updated successfully.',
      appointment: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete appointment (Admin only)
// @route   DELETE /api/appointments/:id
// @access  Private (Admin)
export const deleteAppointment = async (req, res) => {
  try {
    const deleted = await Appointment.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }
    return res.status(200).json({ success: true, message: 'Appointment deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
