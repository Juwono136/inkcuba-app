require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
let db;
const client = new MongoClient(process.env.MONGODB_URI);

async function connectDB() {
  try {
    await client.connect();
    db = client.db('inkcuba');
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'InkCuba API is running' });
});

// Get lecturer by email
app.get('/api/users/lecturer/:email', async (req, res) => {
  try {
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

// Get all lecturers
app.get('/api/users/lecturers', async (req, res) => {
  try {
    const lecturers = await db.collection('users').find({ role: 'lecturer' }).toArray();
    res.json(lecturers);
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({ error: 'Failed to fetch lecturers' });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await db.collection('projects').find({}).toArray();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project by ID
app.get('/api/projects/:id', async (req, res) => {
  try {
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

// Get projects by lecturer email
app.get('/api/projects/lecturer/:email', async (req, res) => {
  try {
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

// Get filtered projects
app.post('/api/projects/filter', async (req, res) => {
  try {
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

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});

// Shutdown
process.on('SIGINT', async () => {
  console.log('Server Shutting down...');
  await client.close();
  process.exit(0);
});