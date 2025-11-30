import React from 'react';
import PasswordInput from './PasswordInput';
import PasswordRequirements from './PasswordRequirements';

const PasswordSection = ({ formData, onChange, passwordValidation }) => {
  return (
    <>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Change Password</h3>

      {/* Current Password */}
      <PasswordInput
        label="Current Password"
        name="currentPassword"
        value={formData.currentPassword}
        onChange={onChange}
        placeholder="Enter current password"
      />

      {/* New Password */}
      <PasswordInput
        label="New Password"
        name="newPassword"
        value={formData.newPassword}
        onChange={onChange}
        placeholder="Enter new password"
      />

      {/* Confirm New Password */}
      <PasswordInput
        label="Confirm New Password"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={onChange}
        placeholder="Confirm new password"
      />

      {/* Password Requirements */}
      <PasswordRequirements validation={passwordValidation} />
    </>
  );
};

export default PasswordSection;