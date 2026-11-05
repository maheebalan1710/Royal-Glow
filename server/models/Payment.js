// Mongoose Model: Payment
// Payment methods: Card, UPI, Cash, NetBanking
// Status: Pending, Completed, Refunded

import { memoryStore, generateId } from './dataStore.js';

export const Payment = {
  find: async (filter = {}) => {
    let list = [...memoryStore.payments];
    if (filter.customer) {
      list = list.filter(p => p.customer === filter.customer);
    }
    if (filter.paymentMethod && filter.paymentMethod !== 'All') {
      list = list.filter(p => p.paymentMethod === filter.paymentMethod);
    }
    if (filter.status && filter.status !== 'All') {
      list = list.filter(p => p.status === filter.status);
    }
    
    // Sort descending by paidAt
    list.sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime());

    return list.map(pay => {
      const customer = memoryStore.users.find(u => u._id === pay.customer);
      const appointment = memoryStore.appointments.find(a => a._id === pay.appointment);
      let service = null;
      if (appointment) {
        service = memoryStore.services.find(s => s._id === appointment.service);
      }
      return {
        ...pay,
        customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : null,
        appointment: appointment ? { 
          _id: appointment._id, 
          appointmentDate: appointment.appointmentDate, 
          timeSlot: appointment.timeSlot,
          serviceName: service ? service.name : 'Salon Service'
        } : null
      };
    });
  },

  findById: async (id) => {
    const pay = memoryStore.payments.find(p => p._id === id);
    if (!pay) return null;
    const customer = memoryStore.users.find(u => u._id === pay.customer);
    const appointment = memoryStore.appointments.find(a => a._id === pay.appointment);
    return {
      ...pay,
      customer: customer ? { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone } : null,
      appointment: appointment || null
    };
  },

  findByAppointmentId: async (appointmentId) => {
    return memoryStore.payments.find(p => p.appointment === appointmentId) || null;
  },

  create: async (data) => {
    const newPayment = {
      _id: generateId('pay'),
      appointment: data.appointment,
      customer: data.customer,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || 'UPI',
      status: data.status || 'Completed',
      transactionId: data.transactionId || `TXN-${Date.now().toString().slice(-6)}`,
      paidAt: new Date()
    };
    memoryStore.payments.push(newPayment);
    return Payment.findById(newPayment._id);
  },

  findByIdAndUpdate: async (id, updates) => {
    const idx = memoryStore.payments.findIndex(p => p._id === id);
    if (idx === -1) return null;
    memoryStore.payments[idx] = { ...memoryStore.payments[idx], ...updates };
    return Payment.findById(id);
  },

  getTotalRevenue: async () => {
    return memoryStore.payments
      .filter(p => p.status === 'Completed')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }
};

export default Payment;
