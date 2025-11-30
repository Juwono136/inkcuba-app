import React from 'react';

const PasswordRequirements = ({ validation }) => {
  const requirements = [
    { key: 'minLength', label: 'At least 8 characters long' },
    { key: 'hasUppercase', label: 'Contains uppercase letter' },
    { key: 'hasLowercase', label: 'Contains lowercase letter' },
    { key: 'hasNumber', label: 'Contains number' }
  ];

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-3">
      <p className="text-xs font-medium text-gray-700 mb-1.5">Password Requirements:</p>
      <ul className="space-y-0.5">
        {requirements.map(({ key, label }) => (
          <li key={key} className="flex items-center gap-1.5 text-xs">
            {validation[key] ? (
              <svg className="h-3.5 w-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className={validation[key] ? 'text-green-600' : 'text-gray-500'}>
              {label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;