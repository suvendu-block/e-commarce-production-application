import redis from '../config/redis.js';

const WINDOW_SECONDS = 60;
const MAX_REQUESTS = 10;

// Sliding-window limiter — Redis sorted set of request timestamps,
// keyed per IP + endpoint. Fail-open: if Redis is down, let traffic through.
const rateLimiter = (max = MAX_REQUESTS, windowSeconds = WINDOW_SECONDS) => {
    return async (req, res, next) => {
        const key = `rate:auth:${req.ip}:${req.originalUrl.split('?')[0]}`;
        const now = Date.now();

        try {
            // Drop timestamps older than the window, add this request, count them
            const cutoff = now - windowSeconds * 1000;
            const pipeline = redis.pipeline();
            pipeline.zremrangebyscore(key, 0, cutoff);
            pipeline.zadd(key, now, `${now}-${Math.random()}`);
            pipeline.zcard(key);
            pipeline.expire(key, windowSeconds);
            const results = await pipeline.exec();
            const count = results[2][1];

            if (count > max) {
                return res.status(429).json({ message: 'Too many requests, try again later' });
            }
            next();
        } catch (error) {
            // Redis down → don't block the API
            next();
        }
    };
};

export default rateLimiter;
