const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

// CORS configuration — allow your Vercel frontend (and localhost for dev)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL, // Set this in Render env vars to your Vercel URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      return callback(null, true);
    }
    // Also allow any *.vercel.app origin
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all for now; restrict in production as needed
  },
  credentials: true,
}));
app.use(express.json());

// Health check endpoint (Render uses this to verify the service is running)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading db.json:', error);
    return [];
  }
};

const EMERGENCY_DB_FILE = path.join(__dirname, 'emergencies.json');

const readEmergencyDB = () => {
  try {
    const data = fs.readFileSync(EMERGENCY_DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading emergencies.json:', error);
    return [];
  }
};

// Helper function to write to DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
};

const writeEmergencyDB = (data) => {
  try {
    fs.writeFileSync(EMERGENCY_DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to emergencies.json:', error);
  }
};

// GET all trainings
app.get('/api/trainings', (req, res) => {
  const trainings = readDB();
  res.json(trainings);
});

// GET all emergency incidents
app.get('/api/emergencies', (req, res) => {
  const emergencies = readEmergencyDB();
  res.json(emergencies);
});

// POST new emergency incident
app.post('/api/emergencies', (req, res) => {
  const emergencies = readEmergencyDB();

  const newEmergency = {
    ...req.body,
    id: emergencies.length > 0 ? Math.max(...emergencies.map(e => e.id)) + 1 : 1,
    status: req.body.status || 'active',
    createdAt: new Date().toISOString(),
  };

  emergencies.push(newEmergency);
  writeEmergencyDB(emergencies);

  res.status(201).json(newEmergency);
});

// PUT update existing emergency incident
app.put('/api/emergencies/:id', (req, res) => {
  const emergencies = readEmergencyDB();
  const id = parseInt(req.params.id);

  const index = emergencies.findIndex(e => e.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Emergency incident not found' });
  }

  emergencies[index] = { ...emergencies[index], ...req.body };
  writeEmergencyDB(emergencies);

  res.json(emergencies[index]);
});

// POST new training
app.post('/api/trainings', (req, res) => {
  const trainings = readDB();

  const newTraining = {
    ...req.body,
    id: trainings.length > 0 ? Math.max(...trainings.map(t => t.id)) + 1 : 1,
    status: req.body.status || 'scheduled', // default status
  };

  trainings.push(newTraining);
  writeDB(trainings);

  res.status(201).json(newTraining);
});

// PUT update existing training
app.put('/api/trainings/:id', (req, res) => {
  const trainings = readDB();
  const id = parseInt(req.params.id);

  const index = trainings.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Training not found' });
  }

  // Update fields
  trainings[index] = { ...trainings[index], ...req.body };
  writeDB(trainings);

  res.json(trainings[index]);
});

// DELETE existing training
app.delete('/api/trainings/:id', (req, res) => {
  const trainings = readDB();
  const id = parseInt(req.params.id);

  const index = trainings.findIndex(t => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Training not found' });
  }

  trainings.splice(index, 1);
  writeDB(trainings);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
