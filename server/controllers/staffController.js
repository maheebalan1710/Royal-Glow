// Staff Profile Controller
// Profiles for Service Providers (specialization, bio, experience, ratings)
// College Internal Project: Project 21

import StaffProfile from '../models/StaffProfile.js';
import User from '../models/User.js';

// @desc    Get all staff profiles with user info
// @route   GET /api/staff
// @access  Public
export const getStaffProfiles = async (req, res) => {
  try {
    const profiles = await StaffProfile.find();
    return res.status(200).json({ success: true, count: profiles.length, staff: profiles });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff profile by ID or User ID
// @route   GET /api/staff/:id
// @access  Public
export const getStaffById = async (req, res) => {
  try {
    let profile = await StaffProfile.findById(req.params.id);
    if (!profile) {
      profile = await StaffProfile.findByUserId(req.params.id);
    }
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }
    return res.status(200).json({ success: true, staff: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create staff profile
// @route   POST /api/staff
// @access  Private (Admin)
export const createStaffProfile = async (req, res) => {
  try {
    const { userId, specialization, experienceYears, bio } = req.body;

    if (!userId || !specialization || experienceYears === undefined) {
      return res.status(400).json({
        success: false,
        message: 'userId, specialization, and experienceYears are required.'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Assigned user does not exist.' });
    }

    // Ensure user has Service Provider role
    if (user.role !== 'Service Provider') {
      await User.findByIdAndUpdate(userId, { role: 'Service Provider' });
    }

    const newProfile = await StaffProfile.create({
      user: userId,
      specialization,
      experienceYears: Number(experienceYears),
      bio: bio || ''
    });

    return res.status(201).json({
      success: true,
      message: 'Staff profile created successfully.',
      staff: newProfile
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update staff profile
// @route   PUT /api/staff/:id
// @access  Private (Admin, Service Provider self)
export const updateStaffProfile = async (req, res) => {
  try {
    const { specialization, experienceYears, bio, isActive } = req.body;

    const updates = {};
    if (specialization) updates.specialization = specialization;
    if (experienceYears !== undefined) updates.experienceYears = Number(experienceYears);
    if (bio !== undefined) updates.bio = bio;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = await StaffProfile.findByIdAndUpdate(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Staff profile updated successfully.',
      staff: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete staff profile
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
export const deleteStaffProfile = async (req, res) => {
  try {
    const deleted = await StaffProfile.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Staff profile not found.' });
    }
    return res.status(200).json({ success: true, message: 'Staff profile removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
