// Navbar.jsx
// Role-based Navigation Bar for Admin, Receptionist, Service Provider, and Customer

import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  Sparkles, 
  Calendar, 
  Users, 
  Scissors, 
  CreditCard, 
  Star, 
  BarChart3, 
  Clock, 
  LogOut, 
  LogIn, 
  FileText, 
  ChevronDown,
  UserCheck,
  Menu,
  X
} from 'lucide-react';
import ProjectDocsModal from './ProjectDocsModal.jsx';

export default function Navbar() {
  const { user, logout, quickSwitchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleQuickRole = (role) => {
    quickSwitchRole(role);
    setRoleDropdownOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* College Project Banner Header */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-rose-400">Project 21:</span>
          <span>Salon and Spa Booking System (2nd Year Internal Mark Project)</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Role Switcher for Evaluators */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium border border-slate-700 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Switch Role (Viva Demo): </span>
              <strong className="text-white">{user?.role || 'Guest'}</strong>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-52 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-200 py-1 z-50">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100">
                  Select Persona for Marks Evaluation
                </div>
                {['Admin', 'Receptionist', 'Service Provider', 'Customer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => handleQuickRole(r)}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-rose-50 hover:text-rose-700 flex items-center justify-between transition ${
                      user?.role === r ? 'font-bold text-rose-600 bg-rose-50/50' : 'text-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {user?.role === r && <span className="text-[10px] text-rose-500 font-medium">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Project 21 Dossier / Specs */}
          <button
            onClick={() => setShowDocsModal(true)}
            className="flex items-center gap-1 text-rose-300 hover:text-rose-100 transition underline underline-offset-2"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Project Dossier &amp; ER Diagram</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                  Lotus Luxe
                </span>
                <span className="block text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                  Salon &amp; Spa Wellness
                </span>
              </div>
            </Link>

            {/* Role-based Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive('/') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>

              <Link
                to="/services"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive('/services') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Services
              </Link>

              {/* Customer Specific */}
              {user?.role === 'Customer' && (
                <>
                  <Link
                    to="/book"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/book') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Book Appointment
                  </Link>
                  <Link
                    to="/appointments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/appointments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* Service Provider Specific */}
              {user?.role === 'Service Provider' && (
                <>
                  <Link
                    to="/appointments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/appointments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Assigned Appointments
                  </Link>
                  <Link
                    to="/book"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/book') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Book Session
                  </Link>
                  <Link
                    to="/schedules"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/schedules') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Schedule &amp; Slots
                  </Link>
                  <Link
                    to="/payments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/payments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Billing &amp; Payments
                  </Link>
                </>
              )}

              {/* Receptionist Specific */}
              {user?.role === 'Receptionist' && (
                <>
                  <Link
                    to="/appointments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/appointments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Desk Appointments
                  </Link>
                  <Link
                    to="/book"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/book') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Walk-in Booking
                  </Link>
                  <Link
                    to="/schedules"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/schedules') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Staff Schedules
                  </Link>
                  <Link
                    to="/payments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/payments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Billing Desk
                  </Link>
                  <Link
                    to="/reports"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/reports') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Reports
                  </Link>
                </>
              )}

              {/* Admin Specific */}
              {user?.role === 'Admin' && (
                <>
                  <Link
                    to="/reports"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/reports') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Reports &amp; Analytics
                  </Link>
                  <Link
                    to="/appointments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/appointments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    All Bookings
                  </Link>
                  <Link
                    to="/users"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/users') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Users CRUD
                  </Link>
                  <Link
                    to="/schedules"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/schedules') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Staff &amp; Schedules
                  </Link>
                  <Link
                    to="/payments"
                    className={`px-3 py-2 rounded-lg transition ${
                      isActive('/payments') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Payments
                  </Link>
                </>
              )}

              <Link
                to="/reviews"
                className={`px-3 py-2 rounded-lg transition ${
                  isActive('/reviews') ? 'text-rose-600 bg-rose-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Reviews
              </Link>
            </nav>

            {/* Right side auth buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Logout"
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-rose-600 transition"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg shadow-xs transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 text-sm">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Home
            </Link>
            <Link
              to="/services"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Services
            </Link>
            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Book Appointment
            </Link>
            <Link
              to="/appointments"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Appointments
            </Link>
            {(user?.role === 'Admin' || user?.role === 'Receptionist') && (
              <>
                <Link
                  to="/reports"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Reports
                </Link>
                <Link
                  to="/schedules"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
                >
                  Staff &amp; Schedules
                </Link>
              </>
            )}
            {user?.role === 'Admin' && (
              <Link
                to="/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
              >
                Users CRUD
              </Link>
            )}
            <Link
              to="/reviews"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50"
            >
              Reviews
            </Link>

            <div className="pt-3 border-t border-slate-100">
              {user ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-600 font-semibold"
                >
                  Logout ({user.name})
                </button>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 border border-slate-300 rounded-lg text-slate-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 text-center py-2 bg-rose-600 text-white rounded-lg"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Evaluation Project Dossier Modal */}
      <ProjectDocsModal
        isOpen={showDocsModal}
        onClose={() => setShowDocsModal(false)}
      />
    </>
  );
}
