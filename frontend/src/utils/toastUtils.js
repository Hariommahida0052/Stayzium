import toast from 'react-hot-toast';
import React from 'react';

/**
 * Shows a beautiful custom confirmation modal using react-hot-toast.
 * @param {string} message - The message to display.
 * @param {function} onConfirm - The callback to execute when confirmed.
 */
export const showConfirm = (message, onConfirm) => {
  toast.custom((t) => (
    <div
      className={`${
        t.visible ? 'animate-enter' : 'animate-leave'
      } max-w-md w-full bg-white shadow-2xl rounded-2xl pointer-events-auto flex flex-col border border-gray-100 overflow-hidden ring-1 ring-black ring-opacity-5`}
    >
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-bold text-gray-900">Please Confirm</h3>
            <p className="mt-1 text-sm text-gray-500 font-medium">
              {message}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            toast.dismiss(t.id);
            onConfirm();
          }}
          className="px-4 py-2 border border-transparent rounded-lg text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm"
        >
          Confirm
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
  });
};
