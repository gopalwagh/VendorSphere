import { Queue, RedisConnection } from "bullmq";

const notificationQueue = new Queue(
  "notificationQueue",
  {
    connection: {
      url : process.env.REDIS_URL,
    }
  }
)

export default notificationQueue;