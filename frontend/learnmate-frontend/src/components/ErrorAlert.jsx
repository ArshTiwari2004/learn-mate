import React from 'react';
import { XCircleIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{message}</p>
          </div>
          {onDismiss && (
            <div className="mt-3">
              <button
                type="button"
                className="bg-red-50 text-red-800 rounded-md text-sm font-medium hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 px-2 py-1"
                onClick={onDismiss}
              >
                Dismiss
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorAlert;