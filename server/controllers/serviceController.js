// Service Controller
// CRUD operations, Category filters, Search, Price/Duration Sorting & Pagination
// College Internal Project: Project 21

import Service from '../models/Service.js';

// @desc    Get all services with filters, sorting & pagination
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const { category, search, sortBy, page = 1, limit = 9 } = req.query;

    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (search) filter.search = search;
    if (sortBy) filter.sortBy = sortBy;

    const allServices = await Service.find(filter);

    // Apply pagination
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = allServices.slice(startIndex, startIndex + limitNum);

    return res.status(200).json({
      success: true,
      count: paginated.length,
      total: allServices.length,
      currentPage: pageNum,
      totalPages: Math.ceil(allServices.length / limitNum) || 1,
      services: paginated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    return res.status(200).json({ success: true, service });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Admin)
export const createService = async (req, res) => {
  try {
    const { name, category, durationMinutes, price, description, image } = req.body;

    // Validate in Express API
    if (!name || !category || !durationMinutes || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, durationMinutes, and price are required.'
      });
    }

    if (Number(price) < 0 || Number(durationMinutes) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be non-negative and duration must be greater than 0.'
      });
    }

    const newService = await Service.create({
      name: name.trim(),
      category,
      durationMinutes: Number(durationMinutes),
      price: Number(price),
      description: description ? description.trim() : '',
      image: image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500'
    });

    return res.status(201).json({
      success: true,
      message: 'Service added successfully.',
      service: newService
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Admin)
export const updateService = async (req, res) => {
  try {
    const { name, category, durationMinutes, price, description, image, isActive } = req.body;

    const updates = {};
    if (name) updates.name = name.trim();
    if (category) updates.category = category;
    if (durationMinutes !== undefined) updates.durationMinutes = Number(durationMinutes);
    if (price !== undefined) updates.price = Number(price);
    if (description !== undefined) updates.description = description.trim();
    if (image) updates.image = image;
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const updated = await Service.findByIdAndUpdate(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      service: updated
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Admin)
export const deleteService = async (req, res) => {
  try {
    const deleted = await Service.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service not found.' });
    }
    return res.status(200).json({
      success: true,
      message: `Service '${deleted.name}' deleted successfully.`
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
