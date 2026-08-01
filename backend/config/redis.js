import Redis from 'ioredis';

// Redis client — available for caching / Bull queues
// enableOfflineQueue: false → commands fail fast while disconnected,
// so rate limiting / caching fail open instead of hanging the API.
const redis = new Redis(process.env.REDIS_URL, {
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (err) => console.error('Redis error:', err.message));

export default redis;
