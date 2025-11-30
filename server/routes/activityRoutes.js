const express = require('express');
const { getDB } = require('../config/database');

const router = express.Router();

/**
 * GET /api/activities
 * Get all activities with filtering and pagination
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { role, dateRange, page = 1, limit = 7 } = req.query;
    const query = {};

    // Role filter
    if (role && role !== 'All Roles') {
      query['user.role'] = role.toLowerCase();
    }

    // Date range filter
    if (dateRange) {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case 'Last 7 days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 30 days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'Last 90 days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.timestamp = { $gte: startDate };
      }
    }

    // Get total count for pagination
    const totalActivities = await db.collection('activities').countDocuments(query);

    // Get paginated activities (sorted by most recent first)
    const activities = await db.collection('activities')
      .find(query)
      .sort({ timestamp: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    res.json({
      activities,
      totalActivities,
      totalPages: Math.ceil(totalActivities / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

/**
 * POST /api/activities
 * Create new activity log entry
 */
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { user, action, type, projectId, categoryId, backupId, metadata } = req.body;

    const activity = {
      user,
      action,
      type,
      projectId: projectId || null,
      categoryId: categoryId || null,
      backupId: backupId || null,
      metadata: metadata || null,
      timestamp: new Date(),
      createdAt: new Date()
    };

    const result = await db.collection('activities').insertOne(activity);
    res.status(201).json({ 
      message: 'Activity logged successfully',
      activityId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

module.exports = router;
