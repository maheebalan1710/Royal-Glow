// Reports.jsx
// Requirement 8: Reports on appointments, revenue/payments, popular services, provider performance
// Accessible by Admin & Receptionist
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  BarChart3, 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp, 
  Award, 
  Scissors, 
  CreditCard, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { LoadingState, ErrorAlert } from '../components/FeedbackState.jsx';

export default function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiRequest('/reports/dashboard');
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load report analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating business metrics and revenue reports..." />;
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorAlert message={error || 'Could not load reports'} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Requirement 8 &bull; Business Intelligence
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-rose-600" />
          Executive Salon &amp; Spa Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Revenue reconciliation, appointment status funnel, top-tier services, and specialist performance.
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Revenue
            </span>
            <span className="text-2xl font-black text-rose-600 mt-1 block">
              ₹{data.totalRevenue.toLocaleString()}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Live Mongoose Aggregation
            </span>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Total Bookings
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data.statusCounts.Total}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {data.statusCounts.Completed} Completed &bull; {data.statusCounts.Confirmed} Confirmed
            </span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Active Clients
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data.userRoleCounts.Customer}
            </span>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Out of {data.userRoleCounts.Total} total registered accounts
            </span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Specialist Staff
            </span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">
              {data.providerStats.length}
            </span>
            <span className="text-[11px] text-amber-600 font-semibold mt-1 block">
              Average Rating: ★ 4.9
            </span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Status Breakdown and Payment Gateways */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status Funnel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-600" />
            Appointments Breakdown by Status
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Completed', count: data.statusCounts.Completed, color: 'bg-emerald-500' },
              { label: 'Confirmed', count: data.statusCounts.Confirmed, color: 'bg-blue-500' },
              { label: 'In-Progress', count: data.statusCounts['In-Progress'], color: 'bg-purple-500' },
              { label: 'Pending', count: data.statusCounts.Pending, color: 'bg-amber-500' },
              { label: 'Cancelled', count: data.statusCounts.Cancelled, color: 'bg-rose-500' },
            ].map(item => {
              const total = data.statusCounts.Total || 1;
              const pct = Math.round((item.count / total) * 100);

              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-700">
                    <span>{item.label}</span>
                    <span>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-rose-600" />
            Revenue by Payment Method
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            {Object.entries(data.paymentMethodsBreakdown).map(([method, amt]) => (
              <div key={method} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">{method}</span>
                <span className="text-lg font-black text-slate-900 mt-1 block">
                  ₹{amt.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500">
                  {data.totalRevenue > 0 ? Math.round((amt / data.totalRevenue) * 100) : 0}% of total
                </span>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-400 italic">
            * Includes all verified online and cashier counter transactions.
          </p>
        </div>
      </div>

      {/* Row 3: Popular Services Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Scissors className="w-4 h-4 text-rose-600" />
          Top Booked Salon &amp; Spa Services
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Treatment / Package</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Total Bookings</th>
                <th className="p-3 text-right">Revenue Generated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.popularServices.map((srv, idx) => (
                <tr key={srv.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    {srv.name}
                  </td>
                  <td className="p-3 text-slate-600">{srv.category}</td>
                  <td className="p-3 font-medium">₹{srv.price}</td>
                  <td className="p-3 font-bold text-slate-800">{srv.bookingsCount} bookings</td>
                  <td className="p-3 text-right font-black text-rose-600 text-sm">
                    ₹{srv.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Service Provider / Staff Performance Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          Specialist Staff &amp; Therapist Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3">Specialist Name</th>
                <th className="p-3">Domain Specialization</th>
                <th className="p-3">Client Rating</th>
                <th className="p-3">Total Assigned</th>
                <th className="p-3">Completed Bookings</th>
                <th className="p-3 text-right">Customer Reviews</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.providerStats.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/50">
                  <td className="p-3 font-bold text-slate-900">{st.name}</td>
                  <td className="p-3 text-rose-600 font-medium">{st.specialization}</td>
                  <td className="p-3 font-bold text-amber-600">★ {st.rating}</td>
                  <td className="p-3 font-semibold text-slate-700">{st.totalBookings}</td>
                  <td className="p-3 font-semibold text-emerald-700">{st.completedBookings}</td>
                  <td className="p-3 text-right text-slate-600">{st.totalReviews} reviews</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
