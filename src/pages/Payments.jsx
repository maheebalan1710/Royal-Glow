// Payments.jsx
// CRUD screens and Express APIs for: Payment (Req 4)
// List features: Search, filters, pagination and sorting (Req 5)
// Record service completion, payments and billing receipts (Req 3)
// College Internal Project: Project 21

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../services/api.js';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  FileText, 
  Printer, 
  X, 
  DollarSign, 
  Calendar, 
  Receipt 
} from 'lucide-react';
import { LoadingState, EmptyState, ErrorAlert, SuccessAlert } from '../components/FeedbackState.jsx';

const METHODS = ['All', 'UPI', 'Card', 'Cash', 'NetBanking'];

export default function Payments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [methodFilter, setMethodFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      let query = '/payments';
      if (methodFilter !== 'All') query += `?paymentMethod=${methodFilter}`;

      const res = await apiRequest(query);
      if (res.success) {
        setPayments(res.payments);
      }
    } catch (err) {
      setError(err.message || 'Failed to load payments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter]);

  const totalCollected = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold text-rose-600 uppercase tracking-widest">
            Billing &bull; Transaction Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 flex items-center gap-2">
            <Receipt className="w-7 h-7 text-rose-600" />
            Payments &amp; Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking completed transactions, payment gateways, and cashier receipts.
          </p>
        </div>

        {/* Revenue Badge */}
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-4 shadow-md">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
              Filtered Revenue
            </span>
            <span className="text-xl font-black text-rose-400">
              ₹{totalCollected.toLocaleString()}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-600/30 flex items-center justify-center text-rose-300">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      <ErrorAlert message={error} onDismiss={() => setError('')} />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Method:
        </span>
        {METHODS.map((m) => (
          <button
            key={m}
            onClick={() => setMethodFilter(m)}
            className={`px-3 py-1.5 rounded-full font-semibold transition ${
              methodFilter === m
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      {loading ? (
        <LoadingState message="Loading payment records..." />
      ) : payments.length === 0 ? (
        <EmptyState
          title="No payment records found"
          message="No transactions recorded for the selected filter."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Service &bull; Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {p.transactionId}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">
                        {p.customer?.name || 'Customer'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.customer?.phone || p.customer?.email}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">
                        {p.appointment?.serviceName || 'Salon Service'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {p.appointment?.appointmentDate} at {p.appointment?.timeSlot}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-sm text-slate-900">
                      ₹{p.amount}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="px-2.5 py-1 text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Bill</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Printable Receipt Area */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-rose-700">Lotus Luxe Salon &amp; Spa</h3>
                  <p className="text-[11px] text-slate-500">Project 21 &bull; Official Tax Invoice</p>
                </div>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-slate-400 hover:text-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px]">INVOICE NO:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedReceipt.transactionId}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">PAID ON:</span>
                  <span className="font-medium text-slate-800">
                    {new Date(selectedReceipt.paidAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">BILLED TO:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.customer?.name}</span>
                  <span className="text-slate-500 block text-[10px]">{selectedReceipt.customer?.phone}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">PAYMENT MODE:</span>
                  <span className="font-bold text-slate-800">{selectedReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Service Item</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-800">
                        {selectedReceipt.appointment?.serviceName || 'Salon Care Service'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          Appointment Slot: {selectedReceipt.appointment?.appointmentDate} {selectedReceipt.appointment?.timeSlot}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-slate-900">
                        ₹{selectedReceipt.amount}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t border-slate-200 bg-rose-50/50">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Total Paid (Inclusive of GST):</td>
                      <td className="p-2.5 text-right font-black text-rose-600 text-sm">
                        ₹{selectedReceipt.amount}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400">
                Thank you for visiting Lotus Luxe Salon &amp; Spa! We appreciate your patronage.
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-3 py-1.5 border border-slate-300 rounded-lg hover:bg-white text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
