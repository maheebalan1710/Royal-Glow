// Schedule Controller
// Working hours, days of week, and dynamic available slot calculation
// Prevents time conflicts
// College Internal Project: Project 21

import Schedule from '../models/Schedule.js';
import Appointment from '../models/Appointment.js';
import User from '../models/User.js';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// @desc    Get schedules
// @route   GET /api/schedules
// @access  Public
export const getSchedules = async (req, res) => {
  try {
    const { staff, dayOfWeek } = req.query;
    const filter = {};
    if (staff) filter.staff = staff;
    if (dayOfWeek) filter.dayOfWeek = dayOfWeek;

    const schedules = await Schedule.find(filter);
    return res.status(200).json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dynamic available slots for a staff on a given date
// @route   GET /api/schedules/available-slots
// @access  Public
export const getAvailableSlots = async (req, res) => {
  try {
    const { staffId, date } = req.query;

    if (!staffId || !date) {
      return res.status(400).json({
        success: false,
        message: 'staffId and date (YYYY-MM-DD) are required.'
      });
    }

    // Determine day of week from date
    const selectedDate = new Date(`${date}T00:00:00`);
    const dayOfWeek = DAYS[selectedDate.getDay()];

    // Find staff's schedule for this day
    const schedules = await Schedule.find({ staff: staffId, dayOfWeek });
    const staffSchedule = schedules[0];

    // If staff does not work on this day or is marked unavailable
    if (!staffSchedule || !staffSchedule.isAvailable) {
      return res.status(200).json({
        success: true,
        dayOfWeek,
        isWorkingDay: false,
        message: `Staff is off on ${dayOfWeek}. Please choose another day or staff.`,
        availableSlots: []
      });
    }

    // Generate slots between startTime and endTime in 1-hour increments
    const startHour = parseInt(staffSchedule.startTime.split(':')[0], 10);
    const endHour = parseInt(staffSchedule.endTime.split(':')[0], 10);
    const breakStartHour = parseInt(staffSchedule.breakStartTime.split(':')[0], 10);
    const breakEndHour = parseInt(staffSchedule.breakEndTime.split(':')[0], 10);

    const allSlots = [];
    for (let h = startHour; h < endHour; h++) {
      // Skip lunch / break period
      if (h >= breakStartHour && h < breakEndHour) {
        continue;
      }
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      allSlots.push(timeStr);
    }

    // Get active booked appointments for this staff on this date
    const bookedAppointments = await Appointment.find({
      staff: staffId,
      date: date
    });

    const activeBookings = bookedAppointments.filter(a => a.status !== 'Cancelled');
    const bookedSlots = activeBookings.map(a => a.timeSlot);

    // Filter available slots
    const availableSlots = allSlots.map(slot => ({
      time: slot,
      isBooked: bookedSlots.includes(slot)
    }));

    return res.status(200).json({
      success: true,
      dayOfWeek,
      isWorkingDay: true,
      schedule: {
        startTime: staffSchedule.startTime,
        endTime: staffSchedule.endTime,
        breakTime: `${staffSchedule.breakStartTime} - ${staffSchedule.breakEndTime}`
      },
      slots: availableSlots
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create schedule
// @route   POST /api/schedules
// @access  Private (Admin, Service Provider)
export const createSchedule = async (req, res) => {
  try {
    const { staff, dayOfWeek, startTime, endTime, breakStartTime, breakEndTime, isAvailable } = req.body;

    if (!staff || !dayOfWeek) {
      return res.status(400).json({
        success: false,
        message: 'staff and dayOfWeek are required.'
      });
    }

    const newSchedule = await Schedule.create({
      staff,
      dayOfWeek,
      startTime: startTime || '09:00',
      endTime: endTime || '18:00',
      breakStartTime: breakStartTime || '13:00',
      breakEndTime: breakEndTime || '14:00',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    return res.status(201).json({
      success: true,
      message: 'Schedule created successfully.',
      schedule: newSchedule
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private (Admin, Service Provider)
export const updateSchedule = async (req, res) => {
  try {
    const updated = await Schedule.findByIdAndUpdate(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }
    return res.status(200).json({
      success: true,
      message: 'Schedule updated successfully.',
      schedule: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private (Admin)
export const deleteSchedule = async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }
    return res.status(200).json({ success: true, message: 'Schedule deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
