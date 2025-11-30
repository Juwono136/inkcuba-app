const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:id
 * Get single project by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDB();
    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

/**
 * GET /api/projects/lecturer/:email
 * Get projects by lecturer email
 */
router.get('/lecturer/:email', async (req, res) => {
  try {
    const db = getDB();
    const projects = await db.collection('projects').find({
      reviewedByEmail: req.params.email,  
      status: 'approved'  
    }).toArray();
    
    res.json(projects);
  } catch (error) {
    console.error('Error fetching lecturer projects:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer projects' });
  }
});

/**
 * POST /api/projects/filter
 * Get filtered projects
 */
router.post('/filter', async (req, res) => {
  try {
    const db = getDB();
    const { batch, program, course, search } = req.body;
    const query = {};

    if (batch) query.batch = batch;
    if (program) query.program = program;
    if (course) query.course = course;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await db.collection('projects').find(query).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Error filtering projects:', error);
    res.status(500).json({ error: 'Failed to filter projects' });
  }
});

/**
 * POST /api/projects
 * Create new project (with activity logging)
 */
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { title, description, user, batch, program, course } = req.body;

    const project = {
      title,
      description,
      batch,
      program,
      course,
      status: 'pending',
      submittedBy: user,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('projects').insertOne(project);
    const projectId = `PRJ-${Date.now().toString().slice(-6)}`;

    // Log the activity
    await logActivity({
      user: user,
      action: `Submitted new project "${title}" for review`,
      type: 'File Upload',
      projectId
    });

    res.status(201).json({ 
      message: 'Project created successfully',
      projectId: result.insertedId 
    });
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

/**
 * PATCH /api/projects/:id/approve
 * Approve project (with activity logging)
 */
router.patch('/:id/approve', async (req, res) => {
  try {
    const db = getDB();
    const { lecturer } = req.body;

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'approved',
          reviewedBy: lecturer,
          reviewedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Log the activity
    await logActivity({
      user: lecturer,
      action: `Reviewed and approved project "${project.title}"`,
      type: 'Approval',
      projectId: req.params.id
    });

    res.json({ message: 'Project approved successfully' });
  } catch (error) {
    console.error('Error approving project:', error);
    res.status(500).json({ error: 'Failed to approve project' });
  }
});

/**
 * PATCH /api/projects/:id/reject
 * Reject project (with activity logging)
 */
router.patch('/:id/reject', async (req, res) => {
  try {
    const db = getDB();
    const { lecturer, feedback } = req.body;

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          status: 'rejected',
          reviewedBy: lecturer,
          feedback,
          reviewedAt: new Date(),
          updatedAt: new Date()
        } 
      }
    );

    // Log the activity
    await logActivity({
      user: lecturer,
      action: `Rejected project "${project.title}" and provided feedback`,
      type: 'Rejection',
      projectId: req.params.id
    });

    res.json({ message: 'Project rejected successfully' });
  } catch (error) {
    console.error('Error rejecting project:', error);
    res.status(500).json({ error: 'Failed to reject project' });
  }
});

/**
 * PATCH /api/projects/:id/feedback
 * Provide feedback on project (with activity logging)
 */
router.patch('/:id/feedback', async (req, res) => {
  try {
    const db = getDB();
    const { lecturer, feedback } = req.body;

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          feedback,
          updatedAt: new Date()
        },
        $push: {
          feedbackHistory: {
            from: lecturer,
            message: feedback,
            date: new Date()
          }
        }
      }
    );

    // Log the activity
    await logActivity({
      user: lecturer,
      action: `Provided feedback for project "${project.title}"`,
      type: 'Feedback',
      projectId: req.params.id
    });

    res.json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

module.exports = router;
