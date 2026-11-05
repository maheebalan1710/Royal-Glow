// BookAppointment.jsx
// Core workflow: Book appointments, prevent time conflicts (Req 3)
// Controlled forms using event.preventDefault() (Technical Requirements)
// Double validation in React and Express API (Req 6)
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Scissors, 
  DollarSign, 
  Info,
  CalendarCheck
} from 'lucide-react';
import { LoadingState, ErrorAlert, SuccessAlert } from '../components/FeedbackState.jsx';

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId');

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState(preselectedServiceId || '');
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow's date
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [notes, setNotes] = useState('');
  const [walkinCustomerName, setWalkinCustomerName] = useState('');

  // Data states
  const [services, setServices] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [slotData, setSlotData] = useState({ isWorkingDay: true, slots: [], message: '' });

  // Status feedback states
  const [initialLoading, setInitialLoading] = useState(true);
  const [slotLoading, setSlotLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 1. Fetch available Services and Staff
  useEffect(() => {
    const fetchPrerequisites = async () => {
      setInitialLoading(true);
      setError('');
      try {
        const [servicesRes, staffRes] = await Promise.all([
          apiRequest('/services?limit=100'),
          apiRequest('/staff')
        ]);

        if (servicesRes.success) {
          setServices(servicesRes.services.filter(s => s.isActive));
          if (!selectedServiceId && servicesRes.services.length > 0) {
            setSelectedServiceId(servicesRes.services[0]._id);
          }
        }

        if (staffRes.success) {
          setStaffList(staffRes.staff.filter(s => s.isActive));
          if (staffRes.staff.length > 0) {
            const firstStaffUser = staffRes.staff[0].user;
            setSelectedStaffId(firstStaffUser ? firstStaffUser._id : staffRes.staff[0].user);
          }
        }
      } catch (err) {
        setError(err.message || 'Could not load booking options.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPrerequisites();
  }, []);

  // 2. Fetch available slots whenever staff or date changes (Conflict Prevention!)
  useEffect(() => {
    if (!selectedStaffId || !appointmentDate) return;

    const fetchSlots = async () => {
      setSlotLoading(true);
      setSelectedTimeSlot('');
      try {
        const res = await apiRequest(
          `/schedules/available-slots?staffId=${selectedStaffId}&date=${appointmentDate}`
        );
        if (res.success) {
          setSlotData(res);
        }
      } catch (err) {
        console.error('Failed to query schedule slots:', err);
      } finally {
        setSlotLoading(false);
      }
    };

    fetchSlots();
  }, [selectedStaffId, appointmentDate]);

  // Selected Service and Staff objects
  const selectedService = services.find(s => s._id === selectedServiceId);
  const selectedStaff = staffList.find(s => {
    const u = s.user;
    return (u?._id || u) === selectedStaffId;
  });

  // 3. Controlled form submission with event.preventDefault()
  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // React Form Validation (Requirement 6)
    if (!selectedServiceId) {
      setError('Please select a salon or spa service.');
      return;
    }
    if (!selectedStaffId) {
      setError('Please select a specialist therapist or stylist.');
      return;
    }
    if (!appointmentDate) {
      setError('Please pick an appointment date.');
      return;
    }
    if (!selectedTimeSlot) {
      setError('Please choose an available time slot from the schedule.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        serviceId: selectedServiceId,
        staffId: selectedStaffId,
        appointmentDate,
        timeSlot: selectedTimeSlot,
        notes: notes.trim()
      };

      const res = await apiRequest('/appointments', 'POST', payload);

      if (res.success) {
        setSuccess('Appointment booked successfully! Conflict check verified.');
        setTimeout(() => {
          navigate('/appointments');
        }, 1200);
      }
    } catch (err) {
      // Handles conflict errors returned by Express API
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return <LoadingState message="Initializing booking system..." />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-slate-200">
        <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
          Conflict-Free Appointment Engine
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
          <CalendarCheck className="w-7 h-7 text-rose-600" />
          Book Your Salon &amp; Spa Session
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Real-time verification against specialist schedules, lunch breaks, and active bookings.
        </p>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={success} />

      <form onSubmit={handleSubmitBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Form Selection Inputs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Step 1: Select Service */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-bold">1</span>
              Select Treatment / Service *
            </label>

            <select
              required
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
            >
              {services.map((srv) => (
                <option key={srv._id} value={srv._id}>
                  {srv.name} &bull; {srv.category} &bull; {srv.durationMinutes} mins &bull; ₹{srv.price}
                </option>
              ))}
            </select>

            {selectedService && (
              <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs text-slate-600 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-rose-900">{selectedService.name}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedService.description}</p>
                </div>
                <div className="text-right whitespace-nowrap pl-3">
                  <span className="font-bold text-rose-600 text-sm">₹{selectedService.price}</span>
                  <span className="block text-[10px] text-slate-400">{selectedService.durationMinutes} mins</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Select Specialist */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-bold">2</span>
              Choose Service Provider / Specialist *
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {staffList.map((sp) => {
                const staffUser = sp.user;
                const staffId = staffUser?._id || sp.user;
                const isSelected = selectedStaffId === staffId;

                return (
                  <button
                    type="button"
                    key={sp._id}
                    onClick={() => setSelectedStaffId(staffId)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={staffUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={staffUser?.name || 'Staff'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-900">{staffUser?.name || 'Staff Member'}</p>
                      <p className="text-[11px] text-rose-600 font-medium">{sp.specialization}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        ★ {sp.rating} &bull; {sp.experienceYears} yrs experience
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Date & Dynamic Available Time Slots (Conflict Free) */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <label className="block text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-xs flex items-center justify-center font-bold">3</span>
              Select Date &amp; Available Slot *
            </label>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Appointment Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full sm:w-64 p-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                  Select Time Slot ({slotData.dayOfWeek || 'Selected Day'}):
                </span>
                <span className="text-[11px] text-slate-400">
                  Green = Available &bull; Grey = Booked / Conflict
                </span>
              </div>

              {slotLoading ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  Checking specialist availability and conflict engine...
                </div>
              ) : !slotData.isWorkingDay ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{slotData.message || 'Staff is off on this day. Please select another date.'}</span>
                </div>
              ) : slotData.slots.length === 0 ? (
                <div className="p-3 bg-slate-50 border border-slate-200 text-slate-500 rounded-xl text-xs">
                  No slots scheduled for this specialist on this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slotData.slots.map((slot) => {
                    const isBooked = slot.isBooked;
                    const isSelected = selectedTimeSlot === slot.time;

                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={isBooked}
                        onClick={() => setSelectedTimeSlot(slot.time)}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition flex flex-col items-center justify-center ${
                          isBooked
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        <span>{slot.time}</span>
                        <span className="text-[9px] font-normal">
                          {isBooked ? 'Booked' : 'Available'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: Special Request / Notes */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-sm font-bold text-slate-900">
              Special Instructions / Notes (Optional)
            </label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sensitive skin, preference for organic oil, blow-dry style, etc."
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            ></textarea>
          </div>
        </div>

        {/* Right Col: Booking Summary & Confirm Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-5 sticky top-24">
            <h3 className="font-bold text-base flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-rose-400" />
              Booking Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="font-semibold text-right">{user?.name || 'Guest'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Treatment:</span>
                <span className="font-semibold text-right">{selectedService?.name || 'None'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Specialist:</span>
                <span className="font-semibold text-right">{selectedStaff?.user?.name || 'Selected Staff'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Date:</span>
                <span className="font-semibold text-right">{appointmentDate || 'Not selected'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Time Slot:</span>
                <span className="font-bold text-rose-400 text-right">
                  {selectedTimeSlot ? `${selectedTimeSlot} (${selectedService?.durationMinutes || 60}m)` : 'Not chosen'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-slate-300 font-medium text-xs">Total Bill Amount:</span>
              <span className="text-2xl font-black text-rose-400">
                ₹{selectedService?.price || 0}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedTimeSlot}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition disabled:opacity-40"
            >
              {submitting ? 'Verifying & Confirming...' : 'Confirm Appointment Booking'}
            </button>

            <p className="text-[10px] text-slate-400 text-center leading-relaxed">
              &bull; Prevents double booking on same specialist and time.<br />
              &bull; Payment can be made online or at front desk.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
