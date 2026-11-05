// Mongoose Model: Service
// Categories: Hair Styling, Facial & Skincare, Massage & Spa, Nail Art & Care, Body Scrub & Therapy, Bridal & Grooming

import { memoryStore, generateId } from './dataStore.js';

export const Service = {
  find: async (filter = {}) => {
    let list = [...memoryStore.services];
    if (filter.category && filter.category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === filter.category.toLowerCase());
    }
    if (filter.isActive !== undefined) {
      list = list.filter(s => s.isActive === filter.isActive);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (filter.sortBy === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (filter.sortBy === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (filter.sortBy === 'duration') {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  },

  findById: async (id) => {
    return memoryStore.services.find(s => s._id === id);
  },

  create: async (data) => {
    const newService = {
      _id: generateId('srv'),
      name: data.name,
      category: data.category,
      durationMinutes: Number(data.durationMinutes),
      price: Number(data.price),
      description: data.description || '',
      image: data.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date()
    };
    memoryStore.services.push(newService);
    return newService;
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.services.findIndex(s => s._id === id);
    if (idx === -1) return null;
    memoryStore.services[idx] = { 
      ...memoryStore.services[idx], 
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : memoryStore.services[idx].price,
      durationMinutes: updates.durationMinutes !== undefined ? Number(updates.durationMinutes) : memoryStore.services[idx].durationMinutes
    };
    return memoryStore.services[idx];
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.services.findIndex(s => s._id === id);
    if (idx === -1) return null;
    const deleted = memoryStore.services.splice(idx, 1)[0];
    return deleted;
  },

  countDocuments: async () => memoryStore.services.length
};

export default Service;
