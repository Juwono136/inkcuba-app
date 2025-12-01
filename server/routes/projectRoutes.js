const express = require('express');
const { ObjectId } = require('mongodb');
const { getDB } = require('../config/database');
const { logActivity } = require('../utils/activityLogger');

const router = express.Router();

/**
 * GET /api/projects
 * Get all projects with optional status and assignedLecturerEmail filter
 */
router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const { status, assignedLecturerEmail } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (assignedLecturerEmail) {
      query.assignedLecturerEmail = assignedLecturerEmail;
    }
    
    const projects = await db.collection('projects')
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();
      
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
    const { batch, program, course, search, status } = req.body;
    const query = {};

    if (status) query.status = status;
    if (batch) query['academicInfo.batch'] = batch;
    if (program) query['academicInfo.program'] = program;
    if (course) query['academicInfo.course'] = course;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'submitter.name': { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await db.collection('projects')
      .find(query)
      .sort({ submittedAt: -1 })
      .toArray();
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
      status: 'pending',
      submitter: user,
      academicInfo: {
        batch,
        program,
        course
      },
      teamCollaborators: [],
      projectPreview: {
        image: null,
        demoVideo: null
      },
      links: {
        liveDemo: null,
        videoDemo: null,
        sourceCode: null
      },
      documentation: [],
      feedback: null,
      reviewedBy: null,
      reviewedAt: null,
      submittedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('projects').insertOne(project);
    const projectId = result.insertedId.toString();

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
 * PATCH /api/projects/:id/review
 * Review project (approve or reject with feedback)
 */
router.patch('/:id/review', async (req, res) => {
  try {
    const db = getDB();
    const { status, feedback, reviewedBy, reviewedByEmail } = req.body;

    // Validate status
    if (!['approved', 'needs_revision'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "approved" or "needs_revision"' });
    }

    // Validate required fields
    if (!feedback || !reviewedBy || !reviewedByEmail) {
      return res.status(400).json({ error: 'Missing required fields: feedback, reviewedBy, reviewedByEmail' });
    }

    const project = await db.collection('projects').findOne({
      _id: new ObjectId(req.params.id)
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const updateData = {
      status,
      feedback,
      reviewedBy,
      reviewedByEmail,
      reviewedDate: new Date(),
      updatedAt: new Date()
    };

    await db.collection('projects').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: updateData }
    );

    // Log the activity
    const actionText = status === 'approved' 
      ? `Approved project "${project.title}"` 
      : `Requested revisions for project "${project.title}"`;
    
    await logActivity({
      user: { name: reviewedBy, email: reviewedByEmail, role: 'lecturer' },
      action: actionText,
      type: status === 'approved' ? 'Approval' : 'Revision Request',
      projectId: req.params.id
    });

    res.json({ 
      message: `Project ${status === 'approved' ? 'approved' : 'sent back for revision'} successfully`,
      project: { ...project, ...updateData }
    });
  } catch (error) {
    console.error('Error reviewing project:', error);
    res.status(500).json({ error: 'Failed to review project' });
  }
});

module.exports = router;