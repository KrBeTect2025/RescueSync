const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'db.json');

app.use(cors());
app.use(express.json());

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

// Helper function to write to DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing to db.json:', error);
  }
};

// GET all trainings
app.get('/api/trainings', (req, res) => {
  const trainings = readDB();
  res.json(trainings);
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
