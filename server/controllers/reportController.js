// Report Controller
// Requirement 8: Summary & reports on appointments, revenue, popular services, provider performance
// College Internal Project: Project 21

import Appointment from '../models/Appointment.js';
import Payment from '../models/Payment.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import StaffProfile from '../models/StaffProfile.js';
import Review from '../models/Review.js';

// @desc    Get comprehensive business reports & analytics
// @route   GET /api/reports/dashboard
// @access  Private (Admin, Receptionist)
export const getDashboardReports = async (req, res) => {
  try {
    const allAppointments = await Appointment.find();
    const allPayments = await Payment.find();
    const allServices = await Service.find();
    const allUsers = await User.find();
    const allStaff = await StaffProfile.find();
    const allReviews = await Review.find();

    // 1. Revenue Metrics
    const completedPayments = allPayments.filter(p => p.status === 'Completed');
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const paymentMethodsBreakdown = {
      UPI: completedPayments.filter(p => p.paymentMethod === 'UPI').reduce((s, p) => s + p.amount, 0),
      Card: completedPayments.filter(p => p.paymentMethod === 'Card').reduce((s, p) => s + p.amount, 0),
      Cash: completedPayments.filter(p => p.paymentMethod === 'Cash').reduce((s, p) => s + p.amount, 0),
      NetBanking: completedPayments.filter(p => p.paymentMethod === 'NetBanking').reduce((s, p) => s + p.amount, 0)
    };

    // 2. Appointment Status Breakdown
    const statusCounts = {
      Total: allAppointments.length,
      Pending: allAppointments.filter(a => a.status === 'Pending').length,
      Confirmed: allAppointments.filter(a => a.status === 'Confirmed').length,
      'In-Progress': allAppointments.filter(a => a.status === 'In-Progress').length,
      Completed: allAppointments.filter(a => a.status === 'Completed').length,
      Cancelled: allAppointments.filter(a => a.status === 'Cancelled').length
    };

    // 3. User Role Breakdown
    const userRoleCounts = {
      Total: allUsers.length,
      Customer: allUsers.filter(u => u.role === 'Customer').length,
      'Service Provider': allUsers.filter(u => u.role === 'Service Provider').length,
      Receptionist: allUsers.filter(u => u.role === 'Receptionist').length,
      Admin: allUsers.filter(u => u.role === 'Admin').length
    };

    // 4. Popular Services Analytics
    const serviceBookingsMap = {};
    for (const apt of allAppointments) {
      if (apt.service && apt.service._id) {
        const sId = apt.service._id;
        if (!serviceBookingsMap[sId]) {
          serviceBookingsMap[sId] = {
            id: sId,
            name: apt.service.name,
            category: apt.service.category,
            price: apt.service.price,
            bookingsCount: 0,
            revenue: 0
          };
        }
        serviceBookingsMap[sId].bookingsCount += 1;
        if (apt.status === 'Completed' || apt.payment) {
          serviceBookingsMap[sId].revenue += apt.service.price;
        }
      }
    }

    const popularServices = Object.values(serviceBookingsMap).sort(
      (a, b) => b.bookingsCount - a.bookingsCount
    );

    // 5. Staff Provider Performance
    const providerStats = allStaff.map(staff => {
      const staffUser = staff.user;
      const staffId = staffUser ? staffUser._id : staff.user;
      const assignedApts = allAppointments.filter(a => a.staff && a.staff._id === staffId);
      const completedApts = assignedApts.filter(a => a.status === 'Completed');
      const staffReviews = allReviews.filter(r => r.staff && r.staff._id === staffId);

      return {
        id: staff._id,
        name: staffUser ? staffUser.name : 'Unknown Staff',
        specialization: staff.specialization,
        rating: staff.rating,
        totalBookings: assignedApts.length,
        completedBookings: completedApts.length,
        totalReviews: staffReviews.length
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        paymentMethodsBreakdown,
        statusCounts,
        userRoleCounts,
        popularServices,
        providerStats,
        recentAppointments: allAppointments.slice(0, 5),
        recentPayments: allPayments.slice(0, 5)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
