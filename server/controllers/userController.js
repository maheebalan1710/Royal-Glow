// User Controller
// CRUD operations, role filtering, pagination and search
// College Internal Project: Project 21

import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// @desc    Get all users with search, role filter & pagination
// @route   GET /api/users
// @access  Private (Admin, Receptionist)
export const getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role && role !== 'All') filter.role = role;
    if (search) filter.search = search;

    const allUsers = await User.find(filter);

    // Apply basic pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedUsers = allUsers.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: paginatedUsers.length,
      total: allUsers.length,
      currentPage: pageNum,
      totalPages: Math.ceil(allUsers.length / limitNum) || 1,
      users: paginatedUsers
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password, ...safeUser } = user;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new user (by Admin)
// @route   POST /api/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and phone are required.'
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: role || 'Customer'
    });

    const { password: p, ...safeUser } = newUser;
    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { name, phone, role, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (role) updates.role = role;
    if (avatar) updates.avatar = avatar;

    const updated = await User.findByIdAndUpdate(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const { password, ...safeUser } = updated;
    return res.status(200).json({
      success: true,
      message: 'User updated successfully.',
      user: safeUser
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      message: `User '${deleted.name}' deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
