// Review Controller
// Customer feedback, ratings (1-5 stars) and testimonials
// College Internal Project: Project 21

import Review from '../models/Review.js';
import Appointment from '../models/Appointment.js';

// @desc    Get reviews
// @route   GET /api/reviews
// @access  Public
export const getReviews = async (req, res) => {
  try {
    const { service, staff, rating } = req.query;
    const filter = {};
    if (service) filter.service = service;
    if (staff) filter.staff = staff;
    if (rating) filter.rating = rating;

    const reviews = await Review.find(filter);
    return res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit customer review
// @route   POST /api/reviews
// @access  Private (Customer)
export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId and rating (1-5) are required.'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.'
      });
    }

    const apt = await Appointment.findById(appointmentId);
    if (!apt) {
      return res.status(404).json({ success: false, message: 'Appointment not found.' });
    }

    // Check if review already submitted
    const existing = await Review.findByAppointmentId(appointmentId);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A review has already been submitted for this appointment.'
      });
    }

    const newReview = await Review.create({
      appointment: appointmentId,
      customer: req.user._id,
      service: apt.service._id,
      staff: apt.staff._id,
      rating: numRating,
      comment: comment ? comment.trim() : ''
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      review: newReview
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
