const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/users', require('./routes/user'));
app.use('/api/mobile/auth', require('./routes/mobileAuth'));
app.use('/api/doctors', require('./routes/doctor'));
app.use('/api/dispensaries', require('./routes/dispensary'));
app.use('/api/bookings', require('./routes/booking'));
app.use('/api/timeslots', require('./routes/timeslot'));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to MyNewApp API' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app; 