/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// App.tsx
// Project 21: Salon and Spa Booking System
// Built using React, react-router-dom, Context API only and Tailwind CSS

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Services from './pages/Services.jsx';
import BookAppointment from './pages/BookAppointment.jsx';
import Appointments from './pages/Appointments.jsx';
import StaffSchedule from './pages/StaffSchedule.jsx';
import Payments from './pages/Payments.jsx';
import Reviews from './pages/Reviews.jsx';
import Users from './pages/Users.jsx';
import Reports from './pages/Reports.jsx';
import { ShieldAlert } from 'lucide-react';

// Protected Route Guard with Role verification
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, loading, quickSwitchRole } = useAuth() as { 
    user: any; 
    loading: boolean; 
    quickSwitchRole: (role: string) => void; 
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-500 text-sm">
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center space-y-4">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600">
          Your current role (<strong>{user.role}</strong>) does not have permission to view this section.
          Required role(s): <span className="font-semibold text-rose-600">{allowedRoles.join(', ')}</span>.
        </p>
        <div className="pt-2 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-700 mb-2">
            Click to switch to an authorized role for testing:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {allowedRoles.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => quickSwitchRole(role)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                Switch to {role}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-rose-100 selection:text-rose-900">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/services" element={<Services />} />
              <Route path="/reviews" element={<Reviews />} />

              {/* Booking & Appointments (Protected) */}
              <Route
                path="/book"
                element={
                  <ProtectedRoute allowedRoles={['Customer', 'Receptionist', 'Admin', 'Service Provider']}>
                    <BookAppointment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/appointments"
                element={
                  <ProtectedRoute>
                    <Appointments />
                  </ProtectedRoute>
                }
              />

              {/* Staff Schedules Management */}
              <Route
                path="/schedules"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Receptionist', 'Service Provider']}>
                    <StaffSchedule />
                  </ProtectedRoute>
                }
              />

              {/* Billing and Payments */}
              <Route
                path="/payments"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Receptionist', 'Customer', 'Service Provider']}>
                    <Payments />
                  </ProtectedRoute>
                }
              />

              {/* Admin Data Management (Users CRUD) */}
              <Route
                path="/users"
                element={
                  <ProtectedRoute allowedRoles={['Admin']}>
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Business Reports (Admin & Receptionist) */}
              <Route
                path="/reports"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Receptionist']}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-200">
                  Lotus Luxe Salon &amp; Spa Management System
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Internal Mark Academic Capstone Project 21 &bull; Full Stack MERN Architecture
                </p>
              </div>
              <div className="text-[11px] text-slate-500 text-center sm:text-right">
                <p>Designed with ReactJS (Vite), Express.js, and MongoDB / Mongoose</p>
                <p className="text-slate-400">Admin &bull; Receptionist &bull; Service Provider &bull; Customer</p>
              </div>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
