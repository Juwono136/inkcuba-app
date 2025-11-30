const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

/**
 * GET /api/users
 * Get all users with filtering, sorting, and pagination
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { search, role, status, page = 1, limit = 4, sort = 'name-asc' } = req.query;
    const query = {};

    // Search filter (name or email)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'All Roles') {
      query.role = role.toLowerCase();
    }

    // Status filter
    if (status && status !== 'All Status') {
      query.status = status.toLowerCase();
    }

    // Build sort object 
    let sortObj = { name: 1 }; 
    switch (sort) {
      case 'name-asc':
        sortObj = { name: 1 };
        break;
      case 'name-desc':
        sortObj = { name: -1 };
        break;
      case 'email-asc':
        sortObj = { email: 1 };
        break;
      case 'email-desc':
        sortObj = { email: -1 };
        break;
      case 'newest':
        sortObj = { createdAt: -1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      default:
        sortObj = { name: 1 };
    }

    // Get total count for pagination
    const totalUsers = await db.collection('users').countDocuments(query);

    // Get paginated and sorted users
    const users = await db.collection('users')
      .find(query)
      .sort(sortObj)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    res.json({
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / parseInt(limit)),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/:id
 * Get single user by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Update user role (with activity logging)
 */
router.patch('/:id/role', async (req, res) => {
  try {
    const db = getDB();
    const { role, adminUser } = req.body;

    if (!['student', 'lecturer', 'admin'].includes(role.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get the user being updated
    const targetUser = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldRole = targetUser.role;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { role: role.toLowerCase(), updatedAt: new Date() } }
    );

    // Log the activity
    await logActivity({
      user: adminUser || { name: 'Admin', role: 'admin', avatar: null },
      action: `Changed role for "${targetUser.name}" from ${oldRole} to ${role.toLowerCase()}`,
      type: 'User Management'
    });

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * PATCH /api/users/:id/status
 * Update user status (with activity logging)
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const db = getDB();
    const { status, adminUser } = req.body;

    if (!['active', 'inactive'].includes(status.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get the user being updated
    const targetUser = await db.collection('users').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = targetUser.status;

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: status.toLowerCase(), updatedAt: new Date() } }
    );

    // Log the activity
    await logActivity({
      user: adminUser || { name: 'Admin', role: 'admin', avatar: null },
      action: `Changed status for "${targetUser.name}" from ${oldStatus} to ${status.toLowerCase()}`,
      type: 'User Management'
    });

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

/**
 * GET /api/users/lecturer/:email
 * Get lecturer by email
 */
router.get('/lecturer/:email', async (req, res) => {
  try {
    const db = getDB();
    const lecturer = await db.collection('users').findOne({
      email: req.params.email,
      role: 'lecturer'
    });
    
    if (!lecturer) {
      return res.status(404).json({ error: 'Lecturer not found' });
    }
    
    res.json(lecturer);
  } catch (error) {
    console.error('Error fetching lecturer:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer' });
  }
});

/**
 * GET /api/users/lecturers
 * Get all lecturers
 */
router.get('/lecturers', async (req, res) => {
  try {
    const db = getDB();
    const lecturers = await db.collection('users').find({ role: 'lecturer' }).toArray();
    res.json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ error: 'Failed to fetch lecturers' });
  }
});

module.exports = router;
