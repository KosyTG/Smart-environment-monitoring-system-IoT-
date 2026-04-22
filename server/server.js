require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: false
}));
app.use(express.json());
app.use(morgan('dev'));

const { evaluateReading } = require('./alertEngine');

const clients = new Set();

setInterval(() => {
  for (const client of clients) {
    client.write('event: heartbeat\ndata: \n\n');
  }
}, 25000);


// Validation formatting middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      error: firstError.msg,
      field: firstError.path
    });
  }
  next();
};

// Error handler for JSON parsing errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next();
});

// POST /api/readings
app.post('/api/readings', [
  body('device_id').notEmpty().withMessage('Device ID is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('temperature').isNumeric().withMessage('Temperature must be a number'),
  body('humidity').isFloat({ min: 0, max: 100 }).withMessage('Humidity must be between 0 and 100'),
  body('timestamp').isISO8601().withMessage('Timestamp must be a valid ISO date'),
  validate
], (req, res) => {
  try {
    const { device_id, location, temperature, humidity, timestamp } = req.body;

    const alertResult = evaluateReading({ temperature, humidity });

    const saved = db.insertReading({
      device_id,
      location,
      temperature,
      humidity,
      timestamp,
      alert: alertResult.alert
    });

    if (saved.alert) {
      const payload = JSON.stringify(saved);
      for (const client of clients) {
        client.write(`event: alert\ndata: ${payload}\n\n`);
      }
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error('Error inserting reading:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/readings/batch
app.post('/api/readings/batch', [
  body('device_id').notEmpty().withMessage('Device ID is required'),
  body('readings').isArray({ min: 1 }).withMessage('Readings must be a non-empty array'),
  validate
], (req, res) => {
  try {
    const { device_id, readings } = req.body;

    const dataToInsert = readings.map(r => ({
      ...r,
      device_id, // ensure device_id is on each item for the batch
      alert: evaluateReading({ temperature: r.temperature, humidity: r.humidity }).alert
    }));

    const count = db.insertReadingsBatch(dataToInsert);

    const alertsToBroadcast = dataToInsert.filter(r => r.alert);
    for (const a of alertsToBroadcast) {
      const payload = JSON.stringify(a);
      for (const client of clients) {
        client.write(`event: alert\ndata: ${payload}\n\n`);
      }
    }

    res.status(201).json({ count });
  } catch (err) {
    console.error('Error during batch insert:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/readings
app.get('/api/readings', (req, res) => {
  try {
    const { device_id, from, to, limit } = req.query;
    const result = db.getReadings({ device_id, from, to, limit });
    res.json(result);
  } catch (err) {
    console.error('Error fetching readings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/readings/latest
app.get('/api/readings/latest', (req, res) => {
  try {
    const { device_id } = req.query;
    const result = db.getLatestReading(device_id);
    res.json(result);
  } catch (err) {
    console.error('Error fetching latest readings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/alerts/stream
app.get('/api/alerts/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

// GET /api/alerts
app.get('/api/alerts', (req, res) => {
  try {
    const { limit } = req.query;
    const result = db.getAlerts(limit);
    res.json(result);
  } catch (err) {
    console.error('Error fetching alerts:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// Catch-all for unhandled routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});