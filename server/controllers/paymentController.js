// Payment Controller
// Payment recording, billing status, transaction receipt generation
// Payment methods: Card, UPI, Cash, NetBanking
// College Internal Project: Project 21

import Payment from '../models/Payment.js';
import Appointment from '../models/Appointment.js';

// @desc    Get payments (Customer sees own, Admin/Receptionist sees all)
// @route   GET /api/payments
// @access  Private
export const getPayments = async (req, res) => {
  try {
    const { paymentMethod, status } = req.query;
    const filter = {};

    if (paymentMethod && paymentMethod !== 'All') filter.paymentMethod = paymentMethod;
    if (status && status !== 'All') filter.status = status;

    if (req.user.role === 'Customer') {
      filter.customer = req.user._id;
    }

    const payments = await Payment.find(filter);
    return res.status(200).json({ success: true, count: payments.length, payments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process / Record payment for an appointment
// @route   POST /api/payments
// @access  Private
export const recordPayment = async (req, res) => {
  try {
    const { appointmentId, paymentMethod, amount } = req.body;

    if (!appointmentId || !paymentMethod || !amount) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId, paymentMethod, and amount are required.'
      });
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check if already paid
    const existingPayment = await Payment.findByAppointmentId(appointmentId);
    if (existingPayment && existingPayment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'This appointment has already been paid for.'
      });
    }

    // Generate random transaction ID prefix based on method
    const prefix = paymentMethod.toUpperCase();
    const transactionId = `${prefix}-TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPayment = await Payment.create({
      appointment: appointmentId,
      customer: appointment.customer._id || req.user._id,
      amount: Number(amount),
      paymentMethod,
      status: 'Completed',
      transactionId
    });

    // If appointment is Pending, advance to Confirmed
    if (appointment.status === 'Pending') {
      await Appointment.findByIdAndUpdate(appointmentId, { status: 'Confirmed' });
    }

    return res.status(201).json({
      success: true,
      message: `Payment of ₹${amount} completed successfully via ${paymentMethod}!`,
      payment: newPayment
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get payment receipt by ID
// @route   GET /api/payments/:id
// @access  Private
export const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }
    return res.status(200).json({ success: true, payment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
