import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import Redis from "ioredis";
import ApiError from "../utils/ApiError.js";

// Connection to our Redis server (Jo BullMQ ke liye chal raha hai)
const redisClient = new Redis(process.env.REDIS_URL);

export const rateLimiterMiddleware = rateLimit({
  // Memory store ki jagah Redis store plug kar diya!
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 1 * 60 * 1000,
  max: 3,
  handler: (req, res, next) => {
    next(new ApiError(429, "Rate limit exceeded. Please wait a minute."));
  }
});