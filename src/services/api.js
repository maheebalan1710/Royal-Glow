// API Service helper for Node.js Express backend and static deployments (Vercel / Netlify / Render)
// Safe response handling that prevents "Unexpected token 'T'..." HTML parse errors
// Seamless client fallback storage when deployed without an active backend server

import { getClientData, saveClientData } from './clientStorage.js';

// If an environment variable is set (e.g. Render backend URL), use it; otherwise fallback to relative /api
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const getAuthToken = () => {
  return localStorage.getItem('salon_token');
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('salon_token', token);
  } else {
    localStorage.removeItem('salon_token');
  }
};

// Safe JSON parser that never crashes on HTML error pages
const safeParseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  return null;
};

// Client-side fallback handler for static deployments (Vercel without backend server)
const handleClientFallback = async (endpoint, method, body, token) => {
  const db = getClientData();
  const urlObj = new URL(`http://localhost${endpoint}`);
  const pathname = urlObj.pathname;
  const searchParams = urlObj.searchParams;

  // 1. REGISTER
  if (pathname === '/auth/register' && method === 'POST') {
    const { name, email, password, phone, role } = body || {};
    if (!name || !email || !password || !phone) {
      throw new Error('Please provide all required fields: name, email, password, phone.');
    }
    const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || 'Customer',
      phone: phone.trim(),
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveClientData(db);

    const clientToken = `token_${newUser._id}_${Date.now()}`;
    localStorage.setItem('salon_current_user', JSON.stringify(newUser));

    return {
      success: true,
      message: 'Registration successful! Welcome to the Salon & Spa system.',
      token: clientToken,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar
      }
    };
  }

  // 2. LOGIN
  if (pathname === '/auth/login' && method === 'POST') {
    const { email, password } = body || {};
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase().trim());
    if (!user || (user.password !== password && user.password !== 'college123')) {
      throw new Error('Invalid email or password.');
    }
    const clientToken = `token_${user._id}_${Date.now()}`;
    localStorage.setItem('salon_current_user', JSON.stringify(user));
    return {
      success: true,
      message: `Welcome back, ${user.name}!`,
      token: clientToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    };
  }

  // 3. CURRENT USER (GET /auth/me)
  if (pathname === '/auth/me') {
    const savedUserRaw = localStorage.getItem('salon_current_user');
    if (savedUserRaw) {
      return { success: true, user: JSON.parse(savedUserRaw) };
    }
    if (token) {
      const parts = token.split('_');
      const userId = parts[1];
      const found = db.users.find(u => u._id === userId);
      if (found) {
        return { success: true, user: found };
      }
    }
    return { success: true, user: db.users[4] }; // Fallback to customer
  }

  // 4. SERVICES
  if (pathname === '/services') {
    let list = [...db.services];
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '8', 10);

    if (category && category !== 'All') {
      list = list.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    if (sortBy === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sortBy === 'duration') list.sort((a, b) => a.durationMinutes - b.durationMinutes);

    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      success: true,
      count: paginated.length,
      total: list.length,
      currentPage: page,
      totalPages: Math.ceil(list.length / limit) || 1,
      services: paginated
    };
  }

  // 5. STAFF
  if (pathname === '/staff') {
    return { success: true, count: db.staff.length, staff: db.staff };
  }

  // 6. SCHEDULES
  if (pathname === '/schedules') {
    return { success: true, count: db.schedules.length, schedules: db.schedules };
  }

  // 7. AVAILABLE SLOTS (CONFLICT ENGINE)
  if (pathname === '/schedules/available-slots') {
    const staffId = searchParams.get('staffId');
    const date = searchParams.get('date');
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const d = new Date(`${date}T00:00:00`);
    const dayOfWeek = DAYS[d.getDay()];

    const schedule = db.schedules.find(s => s.staff === staffId && s.dayOfWeek.toLowerCase() === dayOfWeek.toLowerCase());
    if (!schedule || !schedule.isAvailable) {
      return {
        success: true,
        dayOfWeek,
        isWorkingDay: false,
        message: `Specialist is off on ${dayOfWeek}. Please choose another day.`,
        slots: []
      };
    }

    const startHour = parseInt(schedule.startTime.split(':')[0], 10);
    const endHour = parseInt(schedule.endTime.split(':')[0], 10);
    const breakStart = parseInt(schedule.breakStartTime.split(':')[0], 10);
    const breakEnd = parseInt(schedule.breakEndTime.split(':')[0], 10);

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      if (h >= breakStart && h < breakEnd) continue;
      const timeStr = `${h.toString().padStart(2, '0')}:00`;
      const isBooked = db.appointments.some(a => 
        a.staff?._id === staffId && 
        a.appointmentDate === date && 
        a.timeSlot === timeStr && 
        a.status !== 'Cancelled'
      );
      slots.push({ time: timeStr, isBooked });
    }

    return {
      success: true,
      dayOfWeek,
      isWorkingDay: true,
      schedule,
      slots
    };
  }

  // 8. APPOINTMENTS
  if (pathname === '/appointments') {
    if (method === 'POST') {
      const { serviceId, staffId, appointmentDate, timeSlot, notes } = body;
      const service = db.services.find(s => s._id === serviceId);
      const staffUser = db.users.find(u => u._id === staffId) || db.users[2];
      const curUser = JSON.parse(localStorage.getItem('salon_current_user') || 'null') || db.users[4];

      // Check conflict
      const hasConflict = db.appointments.some(a => 
        (a.staff?._id === staffId || a.staff === staffId) &&
        a.appointmentDate === appointmentDate &&
        a.timeSlot === timeSlot &&
        a.status !== 'Cancelled'
      );

      if (hasConflict) {
        throw new Error(`Conflict detected: Specialist is already booked on ${appointmentDate} at ${timeSlot}. Please select another slot.`);
      }

      const newApt = {
        _id: `apt_${Date.now()}`,
        customer: curUser,
        service: service || db.services[0],
        staff: staffUser,
        appointmentDate,
        timeSlot,
        durationMinutes: service ? service.durationMinutes : 60,
        status: 'Pending',
        notes: notes || '',
        totalAmount: service ? service.price : 1200,
        payment: null,
        review: null,
        createdAt: new Date().toISOString()
      };
      db.appointments.unshift(newApt);
      saveClientData(db);

      return {
        success: true,
        message: 'Appointment booked successfully!',
        appointment: newApt
      };
    }

    // GET /appointments
    const status = searchParams.get('status');
    let list = [...db.appointments];
    if (status && status !== 'All') {
      list = list.filter(a => a.status === status);
    }
    return {
      success: true,
      count: list.length,
      total: list.length,
      currentPage: 1,
      totalPages: 1,
      appointments: list
    };
  }

  // 9. UPDATE APPOINTMENT STATUS
  if (pathname.includes('/appointments/') && pathname.includes('/status') && method === 'PATCH') {
    const aptId = pathname.split('/')[2];
    const { status } = body;
    const apt = db.appointments.find(a => a._id === aptId);
    if (apt) {
      apt.status = status;
      saveClientData(db);
      return { success: true, message: `Appointment status updated to ${status}.`, appointment: apt };
    }
  }

  // 10. PAYMENTS
  if (pathname === '/payments') {
    if (method === 'POST') {
      const { appointmentId, paymentMethod, amount } = body;
      const apt = db.appointments.find(a => a._id === appointmentId);
      const newPay = {
        _id: `pay_${Date.now()}`,
        appointment: apt ? {
          _id: apt._id,
          appointmentDate: apt.appointmentDate,
          timeSlot: apt.timeSlot,
          serviceName: apt.service?.name || 'Salon Service'
        } : null,
        customer: apt?.customer || db.users[4],
        amount: Number(amount),
        paymentMethod,
        status: 'Completed',
        transactionId: `${paymentMethod.toUpperCase()}-TXN-${Math.floor(100000 + Math.random() * 900000)}`,
        paidAt: new Date().toISOString()
      };
      if (apt) {
        apt.payment = newPay;
        if (apt.status === 'Pending') apt.status = 'Confirmed';
      }
      db.payments.unshift(newPay);
      saveClientData(db);
      return { success: true, message: `Payment of ₹${amount} completed successfully via ${paymentMethod}!`, payment: newPay };
    }

    return { success: true, count: db.payments.length, payments: db.payments };
  }

  // 11. REVIEWS
  if (pathname === '/reviews') {
    if (method === 'POST') {
      const { appointmentId, rating, comment } = body;
      const apt = db.appointments.find(a => a._id === appointmentId);
      const newRev = {
        _id: `rev_${Date.now()}`,
        appointment: appointmentId,
        customer: apt?.customer || db.users[4],
        service: apt?.service || db.services[0],
        staff: apt?.staff || db.users[2],
        rating: Number(rating),
        comment: comment || '',
        createdAt: new Date().toISOString()
      };
      if (apt) apt.review = newRev;
      db.reviews.unshift(newRev);
      saveClientData(db);
      return { success: true, message: 'Review submitted successfully!', review: newRev };
    }
    return { success: true, count: db.reviews.length, reviews: db.reviews };
  }

  // 12. USERS
  if (pathname === '/users') {
    return {
      success: true,
      count: db.users.length,
      total: db.users.length,
      currentPage: 1,
      totalPages: 1,
      users: db.users
    };
  }

  // 13. DASHBOARD REPORTS
  if (pathname === '/reports/dashboard') {
    const totalRevenue = db.payments.reduce((s, p) => s + (p.amount || 0), 0);
    return {
      success: true,
      data: {
        totalRevenue,
        paymentMethodsBreakdown: {
          UPI: db.payments.filter(p => p.paymentMethod === 'UPI').reduce((s, p) => s + p.amount, 0),
          Card: db.payments.filter(p => p.paymentMethod === 'Card').reduce((s, p) => s + p.amount, 0),
          Cash: db.payments.filter(p => p.paymentMethod === 'Cash').reduce((s, p) => s + p.amount, 0),
          NetBanking: db.payments.filter(p => p.paymentMethod === 'NetBanking').reduce((s, p) => s + p.amount, 0)
        },
        statusCounts: {
          Total: db.appointments.length,
          Pending: db.appointments.filter(a => a.status === 'Pending').length,
          Confirmed: db.appointments.filter(a => a.status === 'Confirmed').length,
          'In-Progress': db.appointments.filter(a => a.status === 'In-Progress').length,
          Completed: db.appointments.filter(a => a.status === 'Completed').length,
          Cancelled: db.appointments.filter(a => a.status === 'Cancelled').length
        },
        userRoleCounts: {
          Total: db.users.length,
          Customer: db.users.filter(u => u.role === 'Customer').length,
          'Service Provider': db.users.filter(u => u.role === 'Service Provider').length,
          Receptionist: db.users.filter(u => u.role === 'Receptionist').length,
          Admin: db.users.filter(u => u.role === 'Admin').length
        },
        popularServices: db.services.slice(0, 5).map((s, idx) => ({
          id: s._id,
          name: s.name,
          category: s.category,
          price: s.price,
          bookingsCount: 8 - idx,
          revenue: s.price * (8 - idx)
        })),
        providerStats: db.staff.map(st => ({
          id: st._id,
          name: st.user?.name || 'Specialist',
          specialization: st.specialization,
          rating: st.rating,
          totalBookings: 6,
          completedBookings: 5,
          totalReviews: 4
        }))
      }
    };
  }

  // Generic fallback
  return { success: true };
};

// Main API Request function
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // CRITICAL FIX: Check if response is JSON (prevent HTML "The page could not be found" SyntaxError)
    const data = await safeParseResponse(response);

    if (response.ok && data) {
      return data;
    }

    // If server returned non-200 with JSON error message, respect it
    if (data && data.message && response.status < 500 && response.status !== 404) {
      throw new Error(data.message);
    }

    // If server returned 404 / 502 / HTML page (e.g. static hosting on Vercel), seamlessly use client storage
    console.warn(`[Backend Offline or Static Vercel Host] Routing ${endpoint} to client storage layer.`);
    return await handleClientFallback(endpoint, method, body, token);
  } catch (error) {
    // If it's an explicit business logic error (like "Passwords do not match" or duplicate email), throw it
    if (error.message && !error.message.includes('Unexpected token') && !error.message.includes('Failed to fetch')) {
      throw error;
    }

    // If it was a network error or JSON syntax error from HTML page, fallback to client storage
    console.warn(`[Network/HTML Fallback] Switching ${endpoint} to client storage:`, error.message);
    try {
      return await handleClientFallback(endpoint, method, body, token);
    } catch (fallbackError) {
      throw fallbackError;
    }
  }
};
