// Mongoose Model: StaffProfile
// Links to User model with role 'Service Provider'

import { memoryStore, generateId } from './dataStore.js';

export const StaffProfile = {
  find: async (filter = {}) => {
    let list = [...memoryStore.staffProfiles];
    if (filter.isActive !== undefined) {
      list = list.filter(s => s.isActive === filter.isActive);
    }
    // Populate user details
    return list.map(sp => {
      const user = memoryStore.users.find(u => u._id === sp.user);
      return {
        ...sp,
        user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar } : null
      };
    });
  },

  findOne: async (filter = {}) => {
    const list = await StaffProfile.find(filter);
    return list[0] || null;
  },

  findById: async (id) => {
    const sp = memoryStore.staffProfiles.find(s => s._id === id);
    if (!sp) return null;
    const user = memoryStore.users.find(u => u._id === sp.user);
    return {
      ...sp,
      user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar } : null
    };
  },

  findByUserId: async (userId) => {
    const sp = memoryStore.staffProfiles.find(s => s.user === userId);
    if (!sp) return null;
    const user = memoryStore.users.find(u => u._id === sp.user);
    return {
      ...sp,
      user: user ? { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar } : null
    };
  },

  create: async (data) => {
    const newProfile = {
      _id: generateId('stf'),
      user: data.user,
      specialization: data.specialization,
      experienceYears: Number(data.experienceYears),
      bio: data.bio || '',
      rating: 5.0,
      ratingCount: 1,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
    memoryStore.staffProfiles.push(newProfile);
    return StaffProfile.findById(newProfile._id);
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.staffProfiles.findIndex(s => s._id === id);
    if (idx === -1) return null;
    memoryStore.staffProfiles[idx] = { 
      ...memoryStore.staffProfiles[idx], 
      ...updates,
      experienceYears: updates.experienceYears !== undefined ? Number(updates.experienceYears) : memoryStore.staffProfiles[idx].experienceYears
    };
    return StaffProfile.findById(id);
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.staffProfiles.findIndex(s => s._id === id);
    if (idx === -1) return null;
    return memoryStore.staffProfiles.splice(idx, 1)[0];
  }
};

export default StaffProfile;
