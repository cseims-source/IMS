import React from 'react';
import { useNotification } from '../contexts/NotificationContext.jsx';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const icons = {
  success: <CheckCircle className="text-green-500" />,
  error: <AlertTriangle className="text-red-500" />,
  info: <Info className="text-blue-500" />,
};

const Toast = ({ message, type, onDismiss }) => {
  const icon = icons[type] || icons.info;
  const baseClasses = "flex items-center w-full max-w-xs p-4 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-lg";

  return (
    <div className={baseClasses} role="alert">
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg">
        {icon}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
        onClick={onDismiss}
        aria-label="Close"
      >
        <span className="sr-only">Close</span>
        <X size={20} />
      </button>
    </div>
  );
};

export default function ToastContainer() {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed top-5 right-5 z-[200] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}