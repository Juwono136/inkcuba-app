import React from 'react';

const PasswordNotice = ({ onClose }) => {
  const notices = [
    'You will be logged out from all devices and sessions',
    'Any saved login credentials will need to be updated',
    'Make sure to use a strong password with 8+ characters',
    'Keep your new password secure and don\'t share it'
  ];

  return (
    <div className="w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 hidden lg:block">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2">
          <svg className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h4 className="text-sm font-semibold text-gray-900">Important Password Change Notice</h4>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <ul className="space-y-2 text-sm text-gray-600">
        {notices.map((notice, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
            <span>{notice}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordNotice;