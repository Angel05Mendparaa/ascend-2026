import express from 'express';
import cors from 'cors';
import { reconcileEvents } from './engine.js';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// This array is our temporary memory to store incoming design events
let events = [];

// The test route you already successfully built!
app.get('/', (req, res) => {
  res.status(200).json({ message: "Hello! The ASCEND API is successfully running." });
});

// NEW: The POST route to ingest design system events
app.post('/events', (req, res) => {
  const { source, componentId, timestamp, action, data } = req.body;

  // Validation: If any required piece of data is missing, reject it.
  if (!source || !componentId || !timestamp || !action || !data) {
    return res.status(400).json({ 
      error: 'Malformed event. Missing required fields.' 
    });
  }

  // Save the valid event into our memory array
  const newEvent = { source, componentId, timestamp, action, data };
  events.push(newEvent);

  // Tell the sender that the event was received successfully
  res.status(201).json({ message: 'Event ingested successfully', event: newEvent });
});

// NEW: A route to wipe memory so we can replay simulations
app.post('/reset', (req, res) => {
  events.length = 0; // Empty the array
  res.status(200).json({ message: "Memory wiped for replay." });
});

// NEW: A route to let React easily grab all the events we've saved
app.get('/events', (req, res) => {
  res.status(200).json(events);
});

app.listen(PORT, () => {
  console.log(`Server is awake and listening at http://localhost:${PORT}`);
});

// NEW: A route to let React grab the mathematically resolved component states
app.get('/state', (req, res) => {
  const processedData = reconcileEvents(events);
  res.status(200).json(processedData);
});