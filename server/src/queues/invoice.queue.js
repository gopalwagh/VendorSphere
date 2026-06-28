import { Queue } from "bullmq";

const invoiceQueue = new Queue("invoiceQueue",
  {
    connection:{
      url:process.env.REDIS_URL,
      tls: {
        rejectUnauthorized: false
      },
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
);

export default invoiceQueue;