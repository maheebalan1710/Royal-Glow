// Mongoose Model: Appointment
// Handles booking, status workflow (Pending -> Confirmed -> In-Progress -> Completed -> Cancelled)
// and conflict prevention logic

import { memoryStore, generateId } from './dataStore.js';

export const Appointment = {
  find: async (filter = {}) => {
    let list = [...memoryStore.appointments];

    if (filter.customer) {
      list = list.filter(a => a.customer === filter.customer);
    }
    if (filter.staff) {
      list = list.filter(a => a.staff === filter.staff);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(a => a.status === filter.status);
    }
    if (filter.date) {
      list = list.filter(a => a.appointmentDate === filter.date);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(a => {
        const cust = memoryStore.users.find(u => u._id === a.customer);
        const srv = memoryStore.services.find(s => s._id === a.service);
        const staff = memoryStore.users.find(u => u._id === a.staff);
        return (
          (cust && cust.name.toLowerCase().includes(q)) ||
          (srv && srv.name.toLowerCase().includes(q)) ||
          (staff && staff.name.toLowerCase().includes(q)) ||
          a.appointmentDate.includes(q) ||
          a.status.toLowerCase().includes(q)
        );
      });
    }

    // Sort descending by date & time
    list.sort((a, b) => {
      const d1 = new Date(`${a.appointmentDate}T${a.timeSlot}:00`);
      const d2 = new Date(`${b.appointmentDate}T${b.timeSlot}:00`);
      return d2.getTime() - d1.getTime();
    });

    // Populate references
    return list.map(apt => {
      const customer = memoryStore.users.find(u => u._id === apt.customer);
      const service = memoryStore.services.find(s => s._id === apt.service);
      const staff = memoryStore.users.find(u => u._id === apt.staff);
      const payment = memoryStore.payments.find(p => p.appointment === apt._id);
      const review = memoryStore.reviews.find(r => r.appointment === apt._id);

      return {
        ...apt,
        customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : null,
        service: service ? { _id: service._id, name: service.name, price: service.price, durationMinutes: service.durationMinutes, category: service.category } : null,
        staff: staff ? { _id: staff._id, name: staff.name, email: staff.email, phone: staff.phone } : null,
        payment: payment || null,
        review: review || null
      };
    });
  },

  findById: async (id) => {
    const apt = memoryStore.appointments.find(a => a._id === id);
    if (!apt) return null;
    const customer = memoryStore.users.find(u => u._id === apt.customer);
    const service = memoryStore.services.find(s => s._id === apt.service);
    const staff = memoryStore.users.find(u => u._id === apt.staff);
    const payment = memoryStore.payments.find(p => p.appointment === apt._id);
    const review = memoryStore.reviews.find(r => r.appointment === apt._id);

    return {
      ...apt,
      customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : null,
      service: service ? { _id: service._id, name: service.name, price: service.price, durationMinutes: service.durationMinutes, category: service.category } : null,
      staff: staff ? { _id: staff._id, name: staff.name, email: staff.email, phone: staff.phone } : null,
      payment: payment || null,
      review: review || null
    };
  },

  // Check if a staff member or customer already has a non-cancelled booking in overlapping time
  checkConflict: async ({ staffId, appointmentDate, timeSlot, excludeAppointmentId = null }) => {
    // Only check active/non-cancelled appointments
    const existing = memoryStore.appointments.filter(a => 
      a.staff === staffId &&
      a.appointmentDate === appointmentDate &&
      a.timeSlot === timeSlot &&
      a.status !== 'Cancelled' &&
      a._id !== excludeAppointmentId
    );
    return existing.length > 0;
  },

  create: async (data) => {
    const newApt = {
      _id: generateId('apt'),
      customer: data.customer,
      service: data.service,
      staff: data.staff,
      appointmentDate: data.appointmentDate,
      timeSlot: data.timeSlot,
      durationMinutes: Number(data.durationMinutes) || 60,
      status: data.status || 'Pending',
      notes: data.notes || '',
      totalAmount: Number(data.totalAmount) || 0,
      createdAt: new Date()
    };
    memoryStore.appointments.push(newApt);
    return Appointment.findById(newApt._id);
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.appointments.findIndex(a => a._id === id);
    if (idx === -1) return null;
    memoryStore.appointments[idx] = { 
      ...memoryStore.appointments[idx], 
      ...updates 
    };
    return Appointment.findById(id);
  },

  findByIdAndDelete: async (id) => {
    const idx = memoryStore.appointments.findIndex(a => a._id === id);
    if (idx === -1) return null;
    return memoryStore.appointments.splice(idx, 1)[0];
  },

  countDocuments: async (filter = {}) => {
    let list = memoryStore.appointments;
    if (filter.status) list = list.filter(a => a.status === filter.status);
    return list.length;
  }
};

export default Appointment;
