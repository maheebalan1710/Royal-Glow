// Mongoose Model: Schedule
// Weekly schedules for Service Providers

import { memoryStore, generateId } from './dataStore.js';

export const Schedule = {
  find: async (filter = {}) => {
    let list = [...memoryStore.schedules];
    if (filter.staff) {
      list = list.filter(s => s.staff === filter.staff);
    }
    if (filter.dayOfWeek) {
      list = list.filter(s => s.dayOfWeek.toLowerCase() === filter.dayOfWeek.toLowerCase());
    }
    if (filter.isAvailable !== undefined) {
      list = list.filter(s => s.isAvailable === filter.isAvailable);
    }
    // Populate staff user details
    return list.map(sch => {
      const user = memoryStore.users.find(u => u._id === sch.staff);
      return {
        ...sch,
        staffUser: user ? { _id: user._id, name: user.name, email: user.email } : null
      };
    });
  },

  findById: async (id) => {
    const sch = memoryStore.schedules.find(s => s._id === id);
    if (!sch) return null;
    const user = memoryStore.users.find(u => u._id === sch.staff);
    return {
      ...sch,
      staffUser: user ? { _id: user._id, name: user.name, email: user.email } : null
    };
  },

  create: async (data) => {
    const newSchedule = {
      _id: generateId('sch'),
      staff: data.staff,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime || '09:00',
      endTime: data.endTime || '18:00',
      breakStartTime: data.breakStartTime || '13:00',
      breakEndTime: data.breakEndTime || '14:00',
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
    };
    memoryStore.schedules.push(newSchedule);
    return Schedule.findById(newSchedule._id);
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.schedules.findIndex(s => s._id === id);
    if (idx === -1) return null;
    memoryStore.schedules[idx] = { ...memoryStore.schedules[idx], ...updates };
    return Schedule.findById(id);
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.schedules.findIndex(s => s._id === id);
    if (idx === -1) return null;
    return memoryStore.schedules.splice(idx, 1)[0];
  }
};

export default Schedule;
