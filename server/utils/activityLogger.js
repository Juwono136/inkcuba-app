const { getDB } = require('../config/database');

/**
 * Helper function to format date for metadata
 */
const formatActivityDate = (date) => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) + ' at ' + date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Helper function to log activities to the database
 * @param {Object} params - Activity logging parameters
 * @param {Object} params.user - User object containing name, role, and optional avatar
 * @param {string} params.action - Description of the action performed
 * @param {string} params.type - Type of activity (e.g., 'User Management', 'File Upload', etc.)
 * @param {string} [params.projectId] - Optional project ID
 * @param {string} [params.categoryId] - Optional category ID
 * @param {string} [params.backupId] - Optional backup ID
 */
const logActivity = async ({
  user,
  action,
  type,
  projectId = null,
  categoryId = null,
  backupId = null
}) => {
  try {
    const db = getDB();
    const timestamp = new Date();
    
    await db.collection('activities').insertOne({
      user: {
        name: user.name,
        role: user.role,
        avatar: user.avatar || null
      },
      action,
      type,
      projectId,
      categoryId,
      backupId,
      timestamp,
      metadata: formatActivityDate(timestamp),
      createdAt: timestamp,
      updatedAt: timestamp
    });
    
    console.log(`📝 Activity logged: ${type} - ${action}`);
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

module.exports = {
  formatActivityDate,
  logActivity
};
