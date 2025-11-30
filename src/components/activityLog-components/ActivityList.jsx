import React from 'react';
import ActivityItem from './ActivityItem';

const ActivityList = ({ activities }) => {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      {activities.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <ActivityItem key={activity._id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="px-6 py-12 text-center text-gray-500">
          No activities found matching your criteria.
        </div>
      )}
    </div>
  );
};

export default ActivityList;