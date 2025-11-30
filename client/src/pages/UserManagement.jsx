import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../commons/Navbar';
import Footer from '../commons/Footer';
import UserSearchFilter from '../components/userManagement-components/UserSearchFilter';
import UserTable from '../components/userManagement-components/UserTable';
import Pagination from '../components/userManagement-components/Pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
  const navigate = useNavigate();

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [usersPerPage, setUsersPerPage] = useState(4);

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: usersPerPage,
        sort: 'name-asc'
      });

      if (searchQuery) params.append('search', searchQuery);
      if (roleFilter !== 'All Roles') params.append('role', roleFilter);
      if (statusFilter !== 'All Status') params.append('status', statusFilter);

      const response = await fetch(`${API_URL}/api/users?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
      setTotalUsers(data.totalUsers);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [currentPage, usersPerPage, searchQuery, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, usersPerPage]);

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setUsersPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, role: newRole.toLowerCase() } : user
        )
      );
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user._id === userId ? { ...user, status: newStatus.toLowerCase() } : user
        )
      );
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const indexOfFirstUser = (currentPage - 1) * usersPerPage;
  const indexOfLastUser = Math.min(currentPage * usersPerPage, totalUsers);

  const itemsPerPageOptions = [4, 8, 12];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                Manage Users
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 12.75c1.63 0 3.07.39 4.24.9 1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73 1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1-.99 0-1.93.21-2.78.58A2.01 2.01 0 000 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85A6.95 6.95 0 0020 14c-.39 0-.76.04-1.13.1.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
                </svg>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage verified users and assign roles
              </p>
            </div>
            <button 
              onClick={() => navigate('edit-profile')}
              className="btn btn-neutral bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Edit Profile
            </button>
          </div>

          {/* Search and Filters */}
          <UserSearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Users Per Page - Between filters and table */}
          <div className="flex justify-end mb-4">
            <div className="flex items-center gap-3">
              <label htmlFor="usersPerPage" className="text-sm text-gray-600 whitespace-nowrap">
                Users per page:
              </label>
              <select
                id="usersPerPage"
                value={usersPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white min-w-[70px]"
              >
                {itemsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table */}
          {loading ? (
            <div className="border border-gray-200 rounded-lg p-8 flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <UserTable
              users={users}
              onRoleChange={handleRoleChange}
              onStatusChange={handleStatusChange}
            />
          )}

          {/* Pagination */}
          {!loading && totalUsers > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsers}
              indexOfFirstItem={indexOfFirstUser}
              indexOfLastItem={indexOfLastUser}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Outlet for child routes (Edit Profile Modal) */}
      <Outlet />
    </div>
  );
};

export default UserManagement;