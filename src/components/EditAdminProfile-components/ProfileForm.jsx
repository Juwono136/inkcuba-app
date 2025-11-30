import React from 'react';

const ProfileForm = ({ formData, onChange }) => {
  return (
    <>
      {/* Full Name */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {/* Email Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50"
          disabled
        />
      </div>
    </>
  );
};

export default ProfileForm;