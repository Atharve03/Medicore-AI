const Redis = require('ioredis');
const env = require('./env');
const logger = require('./logger');

const redisClient = new Redis(env.redisUrl, {
  maxRetriesPerRequest: 3,
  // Unit tests import the Express app without using Redis-backed auth flows;
  // avoid opening a socket merely from importing a module.
  lazyConnect: env.nodeEnv === 'test',
});

redisClient.on('connect', () => {
  logger.info(`Redis connected -> ${env.redisUrl}`);
});

redisClient.on('error', (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

module.exports = redisClient;
