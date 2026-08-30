const express = require('express');
const mongoose = require('mongoose');
const redisClient = require('../config/redis');

const router = express.Router();

router.get('/', (req, res) => {
  const mongoStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  res.status(200).json({
    success: true,
    message: 'MediCore AI backend is healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    dependencies: {
      mongo: mongoStates[mongoose.connection.readyState] || 'unknown',
      redis: redisClient.status,
    },
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
