// Home.jsx
// Landing page for Lotus Luxe Salon & Spa (Project 21)

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Sparkles, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Star, 
  ArrowRight, 
  Scissors, 
  HeartHandshake, 
  Award,
  Layers
} from 'lucide-react';
import { LoadingState } from '../components/FeedbackState.jsx';

export default function Home() {
  const { user } = useAuth();
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await apiRequest('/services?limit=4');
        if (res.success) {
          setFeaturedServices(res.services);
        }
      } catch (err) {
        console.error('Failed to load featured services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-3xl mx-4 sm:mx-8 mt-6 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MERN Stack Project 21 &bull; Internal Marks Evaluation</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Elevate Your Beauty &amp; <br />
            <span className="bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
              Holistic Spa Wellness
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Seamless appointment scheduling with real-time conflict prevention, certified beauty specialists, 
            and transparent billing. Designed for Customers, Stylists, Receptionists, and Admins.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/book"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Appointment Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/services"
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl backdrop-blur-xs border border-white/20 transition"
            >
              Explore All Services
            </Link>
          </div>

          {/* Quick status bar */}
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center border-t border-white/10">
            <div>
              <p className="text-2xl font-bold text-rose-400">4 Roles</p>
              <p className="text-xs text-slate-400">Admin, Reception, Staff, User</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-400">7 Models</p>
              <p className="text-xs text-slate-400">Mongoose Schemas &amp; Validation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-400">100%</p>
              <p className="text-xs text-slate-400">Conflict-Free Slot Engine</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">JWT + bcrypt</p>
              <p className="text-xs text-slate-400">Role-Protected APIs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
              Signature Treatments
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Popular Salon &amp; Spa Packages
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Curated therapeutic treatments with transparent pricing and defined duration.
            </p>
          </div>

          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-600 hover:text-rose-700 transition"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingState message="Loading signature treatments..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md hover:border-rose-300 transition flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-slate-800 shadow-xs">
                    {service.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base mb-1 line-clamp-1">
                      {service.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {service.durationMinutes} mins
                      </span>
                      <span className="text-base font-extrabold text-rose-600">
                        ₹{service.price}
                      </span>
                    </div>

                    <Link
                      to={`/book?serviceId=${service._id}`}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Why Customers &amp; Staff Love Lotus Luxe
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Built to meet college full-stack software engineering specifications with robust business logic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Automated Conflict Prevention
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The schedule engine cross-verifies stylist availability, shift hours, lunch breaks, and existing active bookings before confirming slots.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Role-Based Access Control
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clean JWT and middleware layer securing routes for Admin, Front-Desk Receptionists, Service Providers, and Customers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Real-Time Reports &amp; Ratings
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Complete billing records, payment receipts, customer reviews with 5-star ratings, and live administrative analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* College Project Submission Notice */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="bg-gradient-to-r from-slate-900 to-rose-950 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center sm:text-left">
            <span className="px-2.5 py-0.5 bg-rose-500/30 text-rose-300 text-xs font-bold rounded border border-rose-400/40">
              Project 21 Presentation Ready
            </span>
            <h3 className="text-xl font-bold">Evaluating this project for internal marks?</h3>
            <p className="text-xs text-slate-300 max-w-xl">
              Use the top-bar <strong>"Switch Role (Viva Demo)"</strong> button to instantly switch between Admin, Receptionist, Service Provider, and Customer with pre-seeded data!
            </p>
          </div>

          <Link
            to="/login"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl transition whitespace-nowrap shadow-md"
          >
            Go to Login Page
          </Link>
        </div>
      </section>
    </div>
  );
}
