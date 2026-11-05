// Appointments.jsx
// Appointment list with Search, Status Filters, Pagination (Req 5)
// Core Workflow: Status progression, conflict checking, payments and customer feedback (Req 3)
// Controlled forms using event.preventDefault()
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  CreditCard, 
  Star, 
  User, 
  Scissors, 
  ChevronLeft, 
  ChevronRight,
  Edit,
  X,
  Plus
} from 'lucide-react';
import { 
  LoadingState, 
  EmptyState, 
  ErrorAlert, 
  SuccessAlert 
} from '../components/FeedbackState.jsx';

const STATUS_LIST = ['All', 'Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'];

export default function Appointments() {
  const { user } = useAuth();

  // List filter state
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status feedback state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Payment Modal State
  const [payingAppointment, setPayingAppointment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Review Modal State
  const [reviewingAppointment, setReviewingAppointment] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  // Reschedule / Edit Modal (Admin/Receptionist)
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [editDate, setEditDate] = useState('');
  const [editSlot, setEditSlot] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Fetch appointments based on user role and filters
  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      let query = `/appointments?page=${page}&limit=8`;
      if (statusFilter !== 'All') query += `&status=${statusFilter}`;
      if (searchTerm.trim()) query += `&search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await apiRequest(query);
      if (res.success) {
        setAppointments(res.appointments);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.message || 'Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, page]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAppointments();
  };

  // Status Update Handler (Pending -> Confirmed -> In-Progress -> Completed -> Cancelled)
  const handleUpdateStatus = async (id, newStatus) => {
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest(`/appointments/${id}/status`, 'PATCH', { status: newStatus });
      if (res.success) {
        setSuccess(`Appointment status updated to ${newStatus}.`);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    }
  };

  // Process Payment Modal Submit
  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!payingAppointment) return;

    setPaymentLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/payments', 'POST', {
        appointmentId: payingAppointment._id,
        paymentMethod,
        amount: payingAppointment.totalAmount
      });

      if (res.success) {
        setSuccess(res.message);
        setPayingAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.message || 'Payment processing failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Submit Review Modal Submit
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewingAppointment) return;

    setReviewLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await apiRequest('/reviews', 'POST', {
        appointmentId: reviewingAppointment._id,
        rating,
        comment: reviewComment
      });

      if (res.success) {
        setSuccess(res.message);
        setReviewingAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  // Reschedule Save Submit (Admin / Receptionist)
  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!editingAppointment) return;

    setError('');
    setSuccess('');
    try {
      const res = await apiRequest(`/appointments/${editingAppointment._id}`, 'PUT', {
        appointmentDate: editDate,
        timeSlot: editSlot,
        status: editStatus
      });

      if (res.success) {
        setSuccess('Appointment updated successfully!');
        setEditingAppointment(null);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.message || 'Reschedule failed due to conflict.');
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Confirmed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In-Progress':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Role Access &bull; {user?.role || 'Guest'} Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Appointments &amp; Service Workflow
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {totalCount} records found &bull; Page {page} of {totalPages}
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment Booking</span>
        </Link>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={success} onDismiss={() => setSuccess('')} />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, service, stylist, date or status..."
            className="w-full pl-9 pr-24 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md hover:bg-slate-700 transition"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Status:
          </span>
          {STATUS_LIST.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List View */}
      {loading ? (
        <LoadingState message="Loading appointment schedule..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments found"
          message="There are no appointments matching this status filter."
          actionLabel="Book New Appointment"
          onAction={() => window.location.href = '/book'}
        />
      ) : (
        <div className="space-y-4">
          {appointments.map((apt) => (
            <div
              key={apt._id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              {/* Left Column: Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    ID: {apt._id}
                  </span>
                  {apt.payment ? (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Paid ₹{apt.payment.amount} ({apt.payment.paymentMethod})
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Payment Pending
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Scissors className="w-4 h-4 text-rose-600" />
                    {apt.service?.name || 'Salon Treatment'}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Customer: <strong>{apt.customer?.name || 'Customer'}</strong>
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="flex items-center gap-1.5 text-slate-600 text-xs">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    Specialist: <strong>{apt.staff?.name || 'Specialist'}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {apt.appointmentDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {apt.timeSlot} ({apt.durationMinutes || 60} mins)
                  </span>
                  <span className="font-bold text-slate-900">
                    Amount: ₹{apt.totalAmount}
                  </span>
                  {apt.notes && (
                    <span className="italic text-slate-500">
                      &bull; Note: "{apt.notes}"
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Actions based on Role */}
              <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                {/* 1. Customer Actions */}
                {user?.role === 'Customer' && (
                  <>
                    {!apt.payment && apt.status !== 'Cancelled' && (
                      <button
                        onClick={() => setPayingAppointment(apt)}
                        className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )}

                    {apt.status === 'Completed' && !apt.review && (
                      <button
                        onClick={() => {
                          setReviewingAppointment(apt);
                          setRating(5);
                          setReviewComment('');
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
                      >
                        <Star className="w-3.5 h-3.5" /> Leave Review
                      </button>
                    )}

                    {apt.review && (
                      <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Rated ★ {apt.review.rating}
                      </span>
                    )}

                    {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'Cancelled')}
                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-medium transition"
                      >
                        Cancel
                      </button>
                    )}
                  </>
                )}

                {/* 2. Service Provider Actions */}
                {user?.role === 'Service Provider' && (
                  <>
                    {apt.status === 'Confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'In-Progress')}
                        className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Start Service
                      </button>
                    )}

                    {apt.status === 'In-Progress' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'Completed')}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Mark Completed
                      </button>
                    )}

                    {apt.status === 'Pending' && (
                      <button
                        onClick={() => handleUpdateStatus(apt._id, 'Confirmed')}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Confirm Slot
                      </button>
                    )}
                  </>
                )}

                {/* 3. Receptionist & Admin Actions */}
                {(user?.role === 'Receptionist' || user?.role === 'Admin') && (
                  <>
                    <select
                      value={apt.status}
                      onChange={(e) => handleUpdateStatus(apt._id, e.target.value)}
                      className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white font-medium text-slate-700 focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="In-Progress">In-Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>

                    {!apt.payment && (
                      <button
                        onClick={() => setPayingAppointment(apt)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                      >
                        Record Payment
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setEditingAppointment(apt);
                        setEditDate(apt.appointmentDate);
                        setEditSlot(apt.timeSlot);
                        setEditStatus(apt.status);
                      }}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                      title="Reschedule / Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-200">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-xs text-slate-600 font-semibold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Payment Processing Modal */}
      {payingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-rose-400" />
                Process Payment &bull; Bill Desk
              </h3>
              <button 
                onClick={() => setPayingAppointment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-5 space-y-4 text-xs">
              <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-rose-950 block">{payingAppointment.service?.name}</span>
                  <span className="text-slate-500">Date: {payingAppointment.appointmentDate} at {payingAppointment.timeSlot}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Due:</span>
                  <span className="text-lg font-black text-rose-600">₹{payingAppointment.totalAmount}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['UPI', 'Card', 'Cash', 'NetBanking'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`p-2.5 rounded-lg border font-semibold text-center transition ${
                        paymentMethod === method
                          ? 'border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPayingAppointment(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {paymentLoading ? 'Confirming...' : `Pay ₹${payingAppointment.totalAmount}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review & Feedback Modal */}
      {reviewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400" />
                Leave Customer Feedback
              </h3>
              <button 
                onClick={() => setReviewingAppointment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="p-5 space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-800 block text-sm">
                  {reviewingAppointment.service?.name}
                </span>
                <span className="text-slate-500">Specialist: {reviewingAppointment.staff?.name}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Rating (1 to 5 Stars) *
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl transition ${
                        rating >= star ? 'text-amber-400 scale-110' : 'text-slate-200'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="ml-2 text-xs font-bold text-slate-600 self-center">
                    {rating} Star{rating > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Your Review / Comment
                </label>
                <textarea
                  rows="3"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience with our salon service and staff..."
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewingAppointment(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-xs"
                >
                  {reviewLoading ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule / Edit Modal (Admin / Receptionist) */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Edit className="w-4 h-4 text-rose-400" />
                Reschedule / Edit Booking
              </h3>
              <button 
                onClick={() => setEditingAppointment(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Time Slot</label>
                <input
                  type="time"
                  required
                  value={editSlot}
                  onChange={(e) => setEditSlot(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Slot conflicts will be verified automatically.</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="In-Progress">In-Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAppointment(null)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
