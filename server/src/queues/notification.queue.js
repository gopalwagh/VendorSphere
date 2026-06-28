import { Queue, RedisConnection } from "bullmq";

const notificationQueue = new Queue(
  "notificationQueue",
  {
    connection: {
      url : process.env.REDIS_URL,
      tls: {
        rejectUnauthorized: false
      },
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
)

export default notificationQueue;