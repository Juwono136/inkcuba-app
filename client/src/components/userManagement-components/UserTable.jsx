import React from 'react';
import UserRow from './UserRow';

const UserTable = ({ users, onRoleChange, onStatusChange }) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-visible">
      {/* Table Header */}
      <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-xl">
        <h2 className="text-lg font-semibold text-gray-900">Verified Users</h2>
      </div>

      {/* User List */}
      <div className="divide-y divide-gray-200 bg-white rounded-b-xl">
        {users.length > 0 ? (
          users.map((user) => (
            <UserRow
              key={user._id}
              user={user}
              onRoleChange={onRoleChange}
              onStatusChange={onStatusChange}
            />
          ))
        ) : (
          <div className="px-6 py-12 text-center text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default UserTable;