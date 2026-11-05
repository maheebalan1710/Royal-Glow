// Mongoose Model: Review
// Ratings (1-5), comments, linked to appointment, customer, service, staff

import { memoryStore, generateId } from './dataStore.js';

export const Review = {
  find: async (filter = {}) => {
    let list = [...memoryStore.reviews];
    if (filter.service) {
      list = list.filter(r => r.service === filter.service);
    }
    if (filter.staff) {
      list = list.filter(r => r.staff === filter.staff);
    }
    if (filter.rating) {
      list = list.filter(r => Number(r.rating) === Number(filter.rating));
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map(rev => {
      const customer = memoryStore.users.find(u => u._id === rev.customer);
      const service = memoryStore.services.find(s => s._id === rev.service);
      const staff = memoryStore.users.find(u => u._id === rev.staff);
      return {
        ...rev,
        customer: customer ? { _id: customer._id, name: customer.name, avatar: customer.avatar } : null,
        service: service ? { _id: service._id, name: service.name } : null,
        staff: staff ? { _id: staff._id, name: staff.name } : null
      };
    });
  },

  findById: async (id) => {
    return memoryStore.reviews.find(r => r._id === id);
  },

  findByAppointmentId: async (appointmentId) => {
    return memoryStore.reviews.find(r => r.appointment === appointmentId);
  },

  create: async (data) => {
    const newRev = {
      _id: generateId('rev'),
      appointment: data.appointment,
      customer: data.customer,
      service: data.service,
      staff: data.staff,
      rating: Number(data.rating),
      comment: data.comment || '',
      createdAt: new Date()
    };
    memoryStore.reviews.push(newRev);

    // Update staff profile rating average
    const staffReviews = memoryStore.reviews.filter(r => r.staff === data.staff);
    if (staffReviews.length > 0) {
      const totalRating = staffReviews.reduce((sum, r) => sum + r.rating, 0);
      const avg = Number((totalRating / staffReviews.length).toFixed(1));
      const sp = memoryStore.staffProfiles.find(p => p.user === data.staff);
      if (sp) {
        sp.rating = avg;
        sp.ratingCount = staffReviews.length;
      }
    }

    return Review.find({}).then(all => all.find(r => r._id === newRev._id));
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.reviews.findIndex(r => r._id === id);
    if (idx === -1) return null;
    return memoryStore.reviews.splice(idx, 1)[0];
  }
};

export default Review;
