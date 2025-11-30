import React, { useState, useRef, useEffect } from 'react';

const UserRow = ({ user, onRoleChange, onStatusChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Generate initials for avatar placeholder
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const capitalize = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = ['Student', 'Lecturer', 'Admin'];
  const currentRole = capitalize(user.role);

  const handleRoleSelect = (role) => {
    onRoleChange(user._id, role);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center justify-between px-6 py-5 hover:bg-gray-50 transition-colors relative">
      {/* User Info */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm font-medium">
              {getInitials(user.name)}
            </span>
          )}
        </div>

        {/* Name and Email */}
        <div>
          <h3 className="text-base font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {/* Status Badge */}
        <span
          className={`text-sm font-medium ${
            user.status === 'active' ? 'text-gray-700' : 'text-gray-400'
          }`}
        >
          {capitalize(user.status)}
        </span>

        {/* Custom Role Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center justify-between gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all min-w-[120px]"
          >
            <span className="text-sm font-medium text-gray-700">{currentRole}</span>
            <svg
              className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    currentRole === role
                      ? 'bg-gray-900 text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserRow;