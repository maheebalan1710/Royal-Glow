// Feedback State Components
// Requirement 7: Show loading, empty, success and error states for API operations

import React from 'react';
import { Loader2, AlertCircle, CheckCircle2, Inbox } from 'lucide-react';

export const LoadingState = ({ message = 'Loading records...' }) => (
  <div className="flex flex-col items-center justify-center p-12 text-slate-500">
    <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-3" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export const EmptyState = ({ 
  title = 'No records found', 
  message = 'There are no items to display at this moment.', 
  actionLabel, 
  onAction 
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed border-slate-300 rounded-xl my-4">
    <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3">
      <Inbox className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-4">{message}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 p-4 mb-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">Error</p>
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-700 font-bold ml-2"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export const SuccessAlert = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="flex items-start gap-3 p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">
      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">Success</p>
        <p>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-emerald-500 hover:text-emerald-700 font-bold ml-2"
        >
          &times;
        </button>
      )}
    </div>
  );
};
