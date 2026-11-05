// Services.jsx
// CRUD screens and Express APIs for: Service (Req 4)
// List features: Search, filters, pagination and suitable sorting (Req 5)
// Feedback states: loading, empty, success and error (Req 7)
// Controlled forms using event.preventDefault()

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Tag, 
  Edit2, 
  Trash2, 
  ArrowRight, 
  X, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  LoadingState, 
  EmptyState, 
  ErrorAlert, 
  SuccessAlert 
} from '../components/FeedbackState.jsx';

const CATEGORIES = [
  'All',
  'Hair Styling',
  'Facial & Skincare',
  'Massage & Spa',
  'Nail Art & Care',
  'Body Scrub & Therapy',
  'Bridal & Grooming'
];

export default function Services() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // List filter state
  const [services, setServices] = useState([]);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Status feedback state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // CRUD Modal state for Admin
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hair Styling',
    durationMinutes: 45,
    price: 999,
    description: '',
    image: '',
    isActive: true
  });

  // Fetch services when filters or page change
  const fetchServices = async () => {
    setLoading(true);
    setError('');
    try {
      let query = `/services?page=${page}&limit=8`;
      if (category !== 'All') query += `&category=${encodeURIComponent(category)}`;
      if (searchTerm.trim()) query += `&search=${encodeURIComponent(searchTerm.trim())}`;
      if (sortBy !== 'default') query += `&sortBy=${sortBy}`;

      const res = await apiRequest(query);
      if (res.success) {
        setServices(res.services);
        setTotalPages(res.totalPages);
        setTotalCount(res.total);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch services.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [category, sortBy, page]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchServices();
  };

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      category: 'Hair Styling',
      durationMinutes: 45,
      price: 999,
      description: '',
      image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
      isActive: true
    });
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      category: service.category,
      durationMinutes: service.durationMinutes,
      price: service.price,
      description: service.description || '',
      image: service.image || '',
      isActive: service.isActive
    });
    setShowModal(true);
  };

  // Save Service (Create or Update)
  const handleSaveService = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // React form validation
    if (!formData.name.trim() || !formData.category || !formData.price || !formData.durationMinutes) {
      setError('Please fill in name, category, price, and duration.');
      return;
    }

    try {
      if (editingService) {
        await apiRequest(`/services/${editingService._id}`, 'PUT', formData);
        setSuccess('Service updated successfully!');
      } else {
        await apiRequest('/services', 'POST', formData);
        setSuccess('New service added successfully!');
      }
      setShowModal(false);
      fetchServices();
    } catch (err) {
      setError(err.message || 'Failed to save service.');
    }
  };

  // Delete Service (Admin)
  const handleDeleteService = async (serviceId, serviceName) => {
    if (!window.confirm(`Are you sure you want to delete service "${serviceName}"?`)) {
      return;
    }
    setError('');
    setSuccess('');
    try {
      await apiRequest(`/services/${serviceId}`, 'DELETE');
      setSuccess(`Service "${serviceName}" was deleted.`);
      fetchServices();
    } catch (err) {
      setError(err.message || 'Failed to delete service.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Service Catalog &bull; CRUD &amp; Filters
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Salon &amp; Spa Treatments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {totalCount} packages available &bull; Page {page} of {totalPages}
          </p>
        </div>

        {user?.role === 'Admin' && (
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service (Admin CRUD)</span>
          </button>
        )}
      </div>

      {/* Feedback Alerts */}
      <ErrorAlert message={error} onDismiss={() => setError('')} />
      <SuccessAlert message={success} onDismiss={() => setSuccess('')} />

      {/* Filter and Search Bar (Requirement 5) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        {/* Search & Sort Row */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services by treatment name or keyword..."
              className="w-full pl-9 pr-20 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-slate-800 text-white text-xs font-semibold rounded-md hover:bg-slate-700 transition"
            >
              Search
            </button>
          </form>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            >
              <option value="default">Sort: Newest First</option>
              <option value="price_asc">Sort: Price (Low to High)</option>
              <option value="price_desc">Sort: Price (High to Low)</option>
              <option value="duration">Sort: Duration (Shortest)</option>
            </select>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Categories:
          </span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition ${
                category === cat
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid or Loading / Empty States */}
      {loading ? (
        <LoadingState message="Loading salon & spa services..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="No services match your filters"
          message="Try selecting a different category or clearing your search term."
          actionLabel="Reset Filters"
          onAction={() => {
            setCategory('All');
            setSearchTerm('');
            setSortBy('default');
            setPage(1);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 bg-slate-100">
                  <img
                    src={service.image || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500'}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/95 text-slate-800 shadow-xs">
                    {service.category}
                  </div>
                  {!service.isActive && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500 text-white">
                      Inactive
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {service.description || 'Professional salon care with certified styling.'}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <div className="flex items-center justify-between py-2 border-t border-slate-100 mb-3 text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {service.durationMinutes} mins
                  </span>
                  <span className="text-lg font-extrabold text-rose-600">
                    ₹{service.price}
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/book?serviceId=${service._id}`}
                    className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {user?.role === 'Admin' && (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => handleOpenEditModal(service)}
                        className="py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteService(service._id, service.name)}
                        className="py-1.5 px-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-md flex items-center justify-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls (Requirement 5) */}
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

      {/* Create / Edit Service Modal (Admin CRUD) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingService ? 'Edit Service' : 'Add New Service (Admin CRUD)'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Keratin Hair Smoothening"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Duration (Minutes) *
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    required
                    value={formData.durationMinutes}
                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Active Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 bg-white"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief summary of benefits, products used, and steps."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {editingService ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
