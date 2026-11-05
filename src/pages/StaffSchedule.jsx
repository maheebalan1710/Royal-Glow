// StaffSchedule.jsx
// CRUD screens for: StaffProfile & Schedule (Req 4)
// Manage staff schedules and working slots (Req 3)
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Users, 
  Calendar, 
  Clock, 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  X,
  Briefcase
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorAlert, SuccessAlert } from '../components/FeedbackState.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function StaffSchedule() {
  const { user } = useAuth();

  const [staffList, setStaffList] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '18:00',
    breakStartTime: '13:00',
    breakEndTime: '14:00',
    isAvailable: true
  });

  // Edit Staff Profile Modal
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [profileForm, setProfileForm] = useState({
    specialization: '',
    experienceYears: 1,
    bio: ''
  });

  // Fetch staff profiles and schedules
  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [staffRes, schedRes] = await Promise.all([
        apiRequest('/staff'),
        apiRequest('/schedules')
      ]);

      if (staffRes.success) {
        setStaffList(staffRes.staff);
        if (!selectedStaffId && staffRes.staff.length > 0) {
          const firstUser = staffRes.staff[0].user;
          setSelectedStaffId(firstUser?._id || staffRes.staff[0].user);
        }
      }

      if (schedRes.success) {
        setSchedules(schedRes.schedules);
      }
    } catch (err) {
      setError(err.message || 'Failed to load staff schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered schedules for selected staff
  const staffSchedules = schedules.filter(s => s.staff === selectedStaffId);
  const currentStaff = staffList.find(s => {
    const u = s.user;
    return (u?._id || u) === selectedStaffId;
  });

  // Open modal to add schedule
  const handleOpenAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '18:00',
      breakStartTime: '13:00',
      breakEndTime: '14:00',
      isAvailable: true
    });
    setShowScheduleModal(true);
  };

  // Open modal to edit schedule
  const handleOpenEditSchedule = (sch) => {
    setEditingSchedule(sch);
    setScheduleForm({
      dayOfWeek: sch.dayOfWeek,
      startTime: sch.startTime,
      endTime: sch.endTime,
      breakStartTime: sch.breakStartTime,
      breakEndTime: sch.breakEndTime,
      isAvailable: sch.isAvailable
    });
    setShowScheduleModal(true);
  };

  // Save Schedule Submit
  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      if (editingSchedule) {
        await apiRequest(`/schedules/${editingSchedule._id}`, 'PUT', scheduleForm);
        setSuccess('Schedule slot updated successfully!');
      } else {
        await apiRequest('/schedules', 'POST', {
          ...scheduleForm,
          staff: selectedStaffId
        });
        setSuccess('Schedule slot added successfully!');
      }
      setShowScheduleModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to save schedule.');
    }
  };

  // Delete Schedule
  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this working schedule slot?')) return;
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/schedules/${id}`, 'DELETE');
      setSuccess('Schedule deleted.');
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to delete schedule.');
    }
  };

  // Open Profile Edit Modal
  const handleOpenEditProfile = (profile) => {
    setEditingProfile(profile);
    setProfileForm({
      specialization: profile.specialization,
      experienceYears: profile.experienceYears,
      bio: profile.bio || ''
    });
    setShowProfileModal(true);
  };

  // Save Profile Submit
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    setError('');
    setSuccess('');

    try {
      await apiRequest(`/staff/${editingProfile._id}`, 'PUT', profileForm);
      setSuccess('Staff profile updated successfully!');
      setShowProfileModal(false);
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Staff &bull; Schedule &amp; Slots Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Service Provider Profiles &amp; Working Hours
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage weekly schedules, shift start/end times, and lunch breaks.
          </p>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Service Provider') && (
          <button
            onClick={handleOpenAddSchedule}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Working Shift</span>
          </button>
        )}
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={success} onDismiss={() => setSuccess('')} />

      {loading ? (
        <LoadingState message="Loading staff profiles and schedules..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Staff Members List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Specialist:
            </h3>

            <div className="space-y-2">
              {staffList.map((sp) => {
                const u = sp.user;
                const uid = u?._id || sp.user;
                const isSelected = selectedStaffId === uid;

                return (
                  <button
                    key={sp._id}
                    onClick={() => setSelectedStaffId(uid)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center gap-3 ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/60 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={u?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                        alt={u?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="overflow-hidden text-xs">
                      <p className="font-bold text-slate-900 truncate">{u?.name || 'Staff'}</p>
                      <p className="text-[11px] text-rose-600 font-medium truncate">{sp.specialization}</p>
                      <span className="text-[10px] text-slate-400">★ {sp.rating} Rating</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Profile Overview Card */}
            {currentStaff && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Profile Details</span>
                  {(user?.role === 'Admin' || (user?.role === 'Service Provider' && user?._id === selectedStaffId)) && (
                    <button
                      onClick={() => handleOpenEditProfile(currentStaff)}
                      className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      <Edit className="w-3 h-3" /> Edit
                    </button>
                  )}
                </div>
                <p className="text-slate-600 text-[11px]">{currentStaff.bio || 'Professional aesthetician and beauty therapist.'}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                  <div>Experience: <strong className="text-slate-800">{currentStaff.experienceYears} Years</strong></div>
                  <div>Rating: <strong className="text-amber-600">★ {currentStaff.rating} ({currentStaff.ratingCount} reviews)</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Weekly Schedule Slots Table */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Weekly Shifts for {currentStaff?.user?.name || 'Selected Staff'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Schedules define when slots can be booked without conflicts.
                  </p>
                </div>

                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {staffSchedules.length} Active Days
                </span>
              </div>

              {staffSchedules.length === 0 ? (
                <EmptyState
                  title="No shifts defined"
                  message="This specialist does not have any weekly working hours registered yet."
                  actionLabel="Add Shift Slot"
                  onAction={handleOpenAddSchedule}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="p-3">Day of Week</th>
                        <th className="p-3">Working Shift</th>
                        <th className="p-3">Lunch Break</th>
                        <th className="p-3">Status</th>
                        {(user?.role === 'Admin' || user?.role === 'Service Provider') && (
                          <th className="p-3 text-right">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffSchedules.map((sch) => (
                        <tr key={sch._id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-rose-500" />
                            {sch.dayOfWeek}
                          </td>
                          <td className="p-3 text-slate-700">
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">
                              {sch.startTime} - {sch.endTime}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">
                            <span className="font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              {sch.breakStartTime} - {sch.breakEndTime}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sch.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {sch.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </td>
                          {(user?.role === 'Admin' || user?.role === 'Service Provider') && (
                            <td className="p-3 text-right space-x-1">
                              <button
                                onClick={() => handleOpenEditSchedule(sch)}
                                className="p-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded"
                                title="Edit Shift"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {user?.role === 'Admin' && (
                                <button
                                  onClick={() => handleDeleteSchedule(sch._id)}
                                  className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded"
                                  title="Delete Shift"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingSchedule ? 'Edit Shift Schedule' : 'Add New Working Shift'}
              </h3>
              <button onClick={() => setShowScheduleModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Day of Week *</label>
                <select
                  value={scheduleForm.dayOfWeek}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift Start Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.startTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Shift End Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduleForm.endTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Break Start (Lunch)</label>
                  <input
                    type="time"
                    value={scheduleForm.breakStartTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, breakStartTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Break End (Lunch)</label>
                  <input
                    type="time"
                    value={scheduleForm.breakEndTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, breakEndTime: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Available for Booking</label>
                <select
                  value={scheduleForm.isAvailable ? 'true' : 'false'}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, isAvailable: e.target.value === 'true' })}
                  className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="true">Yes &bull; Available for Appointments</option>
                  <option value="false">No &bull; Block Day / Off Day</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Update Staff Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Specialization Title *</label>
                <input
                  type="text"
                  required
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
                  placeholder="e.g. Senior Hair Colorist"
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={profileForm.experienceYears}
                  onChange={(e) => setProfileForm({ ...profileForm, experienceYears: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Bio</label>
                <textarea
                  rows="3"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
