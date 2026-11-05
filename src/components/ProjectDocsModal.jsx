// ProjectDocsModal.jsx
// Displays Internal Mark Project 21 Documentation, ER Diagram, Demo Credentials & Postman Collection

import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Database, 
  ShieldCheck, 
  Layers, 
  Download, 
  Check, 
  Key, 
  ExternalLink 
} from 'lucide-react';

export default function ProjectDocsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedRole, setCopiedRole] = useState(null);

  if (!isOpen) return null;

  const demoAccounts = [
    { role: 'Admin', email: 'admin@salon.edu', pass: 'college123', name: 'Priya Sharma', desc: 'Full CRUD over users, services, staff, all bookings, reports' },
    { role: 'Receptionist', email: 'reception@salon.edu', pass: 'college123', name: 'Rohan Mehta', desc: 'Front desk bookings, walk-ins, payments, schedule viewing' },
    { role: 'Service Provider', email: 'aarav@salon.edu', pass: 'college123', name: 'Aarav Patel (Hair Stylist)', desc: 'View assigned appointments, update status, view ratings' },
    { role: 'Customer', email: 'customer@salon.edu', pass: 'college123', name: 'Neha Gupta', desc: 'Browse services, book slots, simulate payment, leave reviews' },
  ];

  const handleCopy = (email, pass, role) => {
    navigator.clipboard.writeText(`${email} / ${pass}`);
    setCopiedRole(role);
    setTimeout(() => setCopiedRole(null), 2000);
  };

  const handleDownloadPostman = () => {
    const postmanJson = {
      info: {
        name: "Project 21 - Salon and Spa Booking System API",
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        {
          name: "Authentication",
          item: [
            { name: "Register User", request: { method: "POST", url: "{{base_url}}/api/auth/register" } },
            { name: "Login User", request: { method: "POST", url: "{{base_url}}/api/auth/login" } },
            { name: "Get Current Profile", request: { method: "GET", url: "{{base_url}}/api/auth/me" } }
          ]
        },
        {
          name: "Services",
          item: [
            { name: "Get Services (Filters & Sort)", request: { method: "GET", url: "{{base_url}}/api/services?category=Hair Styling" } },
            { name: "Create Service (Admin)", request: { method: "POST", url: "{{base_url}}/api/services" } }
          ]
        },
        {
          name: "Appointments",
          item: [
            { name: "Get Appointments", request: { method: "GET", url: "{{base_url}}/api/appointments" } },
            { name: "Book Appointment (Conflict Check)", request: { method: "POST", url: "{{base_url}}/api/appointments" } },
            { name: "Update Status", request: { method: "PATCH", url: "{{base_url}}/api/appointments/:id/status" } }
          ]
        },
        {
          name: "Schedules",
          item: [
            { name: "Available Slots", request: { method: "GET", url: "{{base_url}}/api/schedules/available-slots?staffId=usr_staff_01&date=2026-11-06" } }
          ]
        },
        {
          name: "Payments",
          item: [
            { name: "Record Payment", request: { method: "POST", url: "{{base_url}}/api/payments" } },
            { name: "Get Payment History", request: { method: "GET", url: "{{base_url}}/api/payments" } }
          ]
        },
        {
          name: "Reports",
          item: [
            { name: "Dashboard Reports", request: { method: "GET", url: "{{base_url}}/api/reports/dashboard" } }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(postmanJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Salon_Spa_Booking_System_Project21_Postman.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider bg-rose-500/30 text-rose-300 rounded border border-rose-400/40">
                  Project 21
                </span>
                <span className="text-xs text-slate-400">Internal Marks Evaluation Dossier</span>
              </div>
              <h2 className="text-xl font-bold text-white mt-1">Salon and Spa Booking System</h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          {[
            { id: 'overview', label: 'Overview & Scope', icon: Layers },
            { id: 'er_diagram', label: 'ER Diagram & Models', icon: Database },
            { id: 'credentials', label: 'Evaluation Logins', icon: Key },
            { id: 'architecture', label: 'Tech Stack & APIs', icon: ShieldCheck },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-rose-600 text-rose-600 bg-white rounded-t-lg'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-900">
                <h4 className="font-semibold text-rose-950 mb-1">Project 21 Specifications Compliance</h4>
                <p>
                  This application satisfies all requirements in the student allocation brief: 4 distinct roles (Admin, Receptionist, Service Provider, Customer),
                  7 Mongoose Models, schedule conflict checking, service management, billing simulation, feedback reviews, list search/filters/pagination,
                  and business intelligence analytics reports.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Functional Work Scope
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                    <li><strong>Authentication:</strong> JWT tokens, bcrypt hashed passwords, protected endpoints.</li>
                    <li><strong>Role Access:</strong> Scoped views and permissions for all 4 roles.</li>
                    <li><strong>Core Workflow:</strong> Book appointment, conflict prevention, status progression.</li>
                    <li><strong>Data Management:</strong> CRUD for all 7 Mongoose models.</li>
                    <li><strong>List Features:</strong> Dynamic search, category filters, sorting, pagination.</li>
                    <li><strong>Validation:</strong> Dual-layer validation (React forms + Express API).</li>
                    <li><strong>Feedback States:</strong> Loading, Empty, Success, and Error states.</li>
                    <li><strong>Reports:</strong> Revenue, status counts, top services, staff performance.</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-white">
                  <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Roles &amp; Permissions Matrix
                  </h4>
                  <div className="overflow-x-auto text-xs">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-left">
                          <th className="p-1.5 border border-slate-200">Role</th>
                          <th className="p-1.5 border border-slate-200">Key Capabilities</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-1.5 border border-slate-200 font-semibold text-rose-700">Admin</td>
                          <td className="p-1.5 border border-slate-200">Full CRUD on all models, business reports, staff manager.</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 border border-slate-200 font-semibold text-amber-700">Receptionist</td>
                          <td className="p-1.5 border border-slate-200">Walk-in bookings, schedule lookup, mark payment, status updates.</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 border border-slate-200 font-semibold text-blue-700">Service Provider</td>
                          <td className="p-1.5 border border-slate-200">View assigned tasks, update In-Progress/Completed, see reviews.</td>
                        </tr>
                        <tr>
                          <td className="p-1.5 border border-slate-200 font-semibold text-emerald-700">Customer</td>
                          <td className="p-1.5 border border-slate-200">Browse services, book slot, make payment, leave rating.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'er_diagram' && (
            <div className="space-y-4">
              <div className="bg-slate-900 text-slate-200 p-4 rounded-xl font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                <p className="text-emerald-400 font-bold mb-2">// MONGOOSE ENTITY RELATIONSHIP (ER) DIAGRAM</p>
                <p className="text-rose-400">User (_id, name, email, password, role, phone, avatar)</p>
                <p className="text-slate-400">&nbsp;&nbsp;▲ 1:1</p>
                <p className="text-amber-400">StaffProfile (_id, user_id, specialization, experienceYears, rating)</p>
                <p className="text-slate-400">&nbsp;&nbsp;▲ 1:M</p>
                <p className="text-cyan-400">Schedule (_id, staff_id, dayOfWeek, startTime, endTime, breakStartTime)</p>
                <p className="text-slate-400">&nbsp;&nbsp;▲ 1:M</p>
                <p className="text-indigo-400">Appointment (_id, customer_id, service_id, staff_id, date, timeSlot, status)</p>
                <p className="text-slate-400">&nbsp;&nbsp;▲ 1:1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;▲ 1:1</p>
                <p className="text-green-400">Payment (_id, appointment_id, amount, method, txnId)&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-yellow-400">Review (_id, appointment_id, rating, comment)</span></p>
                <p className="text-slate-400">&nbsp;&nbsp;▲ M:1</p>
                <p className="text-purple-400">Service (_id, name, category, durationMinutes, price, image, isActive)</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {[
                  { name: 'User', fields: 'name, email, password, role, phone' },
                  { name: 'Service', fields: 'name, category, duration, price' },
                  { name: 'StaffProfile', fields: 'user, specialization, exp, rating' },
                  { name: 'Schedule', fields: 'staff, dayOfWeek, times, breaks' },
                  { name: 'Appointment', fields: 'customer, service, staff, date, slot' },
                  { name: 'Payment', fields: 'appointment, amount, method, txnId' },
                  { name: 'Review', fields: 'appointment, rating, comment' },
                ].map(m => (
                  <div key={m.name} className="border border-slate-200 rounded-lg p-3 bg-slate-50">
                    <span className="font-bold text-slate-800 block text-sm">{m.name}</span>
                    <span className="text-slate-500">{m.fields}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Use these test accounts pre-seeded with encrypted bcrypt passwords to evaluate each role's dashboard during the presentation:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demoAccounts.map(acc => (
                  <div key={acc.role} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-rose-300 transition shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{acc.name}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {acc.role}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-600 mb-3 font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <div>Email: <strong className="text-slate-900">{acc.email}</strong></div>
                      <div>Pass:&nbsp; <strong className="text-slate-900">{acc.pass}</strong></div>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">{acc.desc}</p>
                    <button
                      onClick={() => handleCopy(acc.email, acc.pass, acc.role)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
                    >
                      {copiedRole === acc.role ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5 text-slate-500" />
                          Copy Credentials
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4 text-sm text-slate-700">
              <div className="border border-slate-200 p-4 rounded-xl bg-slate-50">
                <h4 className="font-semibold text-slate-900 mb-2">Technical Implementation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div><strong>Frontend:</strong> React 19 (JavaScript), Vite, Context API, react-router-dom, Tailwind CSS.</div>
                  <div><strong>Backend:</strong> Node.js, Express.js with separate Routers, Controllers, Middlewares.</div>
                  <div><strong>Database:</strong> MongoDB Atlas with Mongoose Schemas &amp; embedded fallback.</div>
                  <div><strong>Security:</strong> JWT tokens, bcryptjs hashing, role-based authorizeRoles middleware.</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl">
                <div>
                  <h4 className="font-semibold text-rose-950 text-sm">Postman API Collection</h4>
                  <p className="text-xs text-rose-700">Download ready-to-import Postman JSON collection for the examiner.</p>
                </div>
                <button
                  onClick={handleDownloadPostman}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs transition"
                >
                  <Download className="w-4 h-4" />
                  Download Collection
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Project Number 21 &bull; 2nd Year Full Stack Mark Submission</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
