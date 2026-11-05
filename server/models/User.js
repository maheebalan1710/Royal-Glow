// Mongoose Model: User
// Role: Admin, Receptionist, Service Provider, Customer

import { MongooseUser, UserSchema, memoryStore, generateId } from './dataStore.js';
import { isUsingMemoryStore } from '../db/connection.js';

export const User = {
  find: async (filter = {}) => {
    let list = [...memoryStore.users];
    if (filter.role) {
      list = list.filter(u => u.role === filter.role);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }
    return list.map(u => ({ ...u, password: undefined }));
  },

  findOne: async (filter) => {
    return memoryStore.users.find(u => {
      for (const key of Object.keys(filter)) {
        if (filter[key] && u[key] && u[key].toString().toLowerCase() !== filter[key].toString().toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  },

  findById: async (id) => {
    return memoryStore.users.find(u => u._id === id);
  },

  create: async (data) => {
    const newUser = {
      _id: generateId('usr'),
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password: data.password,
      role: data.role || 'Customer',
      phone: data.phone || '',
      avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date()
    };
    memoryStore.users.push(newUser);
    return newUser;
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    memoryStore.users[idx] = { ...memoryStore.users[idx], ...updates };
    return memoryStore.users[idx];
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.users.findIndex(u => u._id === id);
    if (idx === -1) return null;
    const deleted = memoryStore.users.splice(idx, 1)[0];
    return deleted;
  },

  countDocuments: async (filter = {}) => {
    let list = [...memoryStore.users];
    if (filter.role) list = list.filter(u => u.role === filter.role);
    return list.length;
  }
};

export default User;
