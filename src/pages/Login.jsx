// Login.jsx
// Controlled form using event.preventDefault() and Context API only
// College Internal Project: Project 21

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, Key, Mail, Sparkles, UserCheck } from 'lucide-react';
import { ErrorAlert } from '../components/FeedbackState.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [email, setEmail] = useState('customer@salon.edu');
  const [password, setPassword] = useState('college123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form submit handler with event.preventDefault()
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Form validation in React
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedUser = await login(email.trim().toLowerCase(), password);
      // Route based on role
      if (loggedUser.role === 'Admin') {
        navigate('/reports');
      } else if (loggedUser.role === 'Receptionist') {
        navigate('/appointments');
      } else if (loggedUser.role === 'Service Provider') {
        navigate('/appointments');
      } else {
        navigate('/services');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill buttons for evaluation demo
  const fillRole = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="w-12 h-12 bg-rose-600 rounded-xl mx-auto flex items-center justify-center mb-3 shadow-md shadow-rose-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Sign In to Lotus Luxe</h2>
          <p className="text-xs text-slate-400 mt-1">
            Salon &amp; Spa Management System (Project 21)
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="bg-rose-50/70 border-b border-rose-100 p-4">
          <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5" />
            1-Click Demo Login for Evaluation:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillRole('admin@salon.edu', 'college123')}
              className="py-1 px-2 bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-medium transition text-left"
            >
              👑 Admin
            </button>
            <button
              type="button"
              onClick={() => fillRole('reception@salon.edu', 'college123')}
              className="py-1 px-2 bg-white hover:bg-amber-100 text-amber-800 border border-amber-200 rounded font-medium transition text-left"
            >
              🛎️ Receptionist
            </button>
            <button
              type="button"
              onClick={() => fillRole('aarav@salon.edu', 'college123')}
              className="py-1 px-2 bg-white hover:bg-blue-100 text-blue-800 border border-blue-200 rounded font-medium transition text-left"
            >
              💇 Stylist / Staff
            </button>
            <button
              type="button"
              onClick={() => fillRole('customer@salon.edu', 'college123')}
              className="py-1 px-2 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded font-medium transition text-left"
            >
              💅 Customer
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          <ErrorAlert message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@salon.edu"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Default demo password: <code>college123</code></p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm rounded-lg transition shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-rose-600 hover:underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
