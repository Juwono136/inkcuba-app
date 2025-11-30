import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../commons/Navbar';
import Footer from '../commons/Footer';
import ActivityFilter from '../components/activityLog-components/ActivityFilter';
import ActivityList from '../components/activityLog-components/ActivityList';
import Pagination from '../components/activityLog-components/Pagination';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ActivityLog = () => {
  // State management
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [dateFilter, setDateFilter] = useState('Last 7 days');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const activitiesPerPage = 7;

  // Fetch activities from API
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: activitiesPerPage
      });

      if (roleFilter !== 'All Roles') params.append('role', roleFilter);
      if (dateFilter) params.append('dateRange', dateFilter);

      const response = await fetch(`${API_URL}/api/activities?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities);
      setTotalActivities(data.totalActivities);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast.error('Failed to load activities');
      setActivities([]);
      setTotalActivities(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, roleFilter, dateFilter]);

  // Fetch activities when filters or page changes
  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, dateFilter]);

  // Calculate pagination indices for display
  const indexOfFirstActivity = (currentPage - 1) * activitiesPerPage;
  const indexOfLastActivity = Math.min(currentPage * activitiesPerPage, totalActivities);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Activity Log
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Track all user activities across projects and system interactions
              </p>
            </div>

            {/* Filters */}
            <ActivityFilter
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
            />
          </div>

          {/* Activity List */}
          {loading ? (
            <div className="border border-gray-200 rounded-xl p-8 flex justify-center">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : (
            <ActivityList activities={activities} />
          )}

          {/* Pagination */}
          {!loading && totalActivities > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalActivities}
              itemsPerPage={activitiesPerPage}
              indexOfFirstItem={indexOfFirstActivity}
              indexOfLastItem={indexOfLastActivity}
              onPageChange={setCurrentPage}
              itemLabel="activities"
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default ActivityLog;