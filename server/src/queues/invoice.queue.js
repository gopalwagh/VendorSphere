import { Queue } from "bullmq";

const invoiceQueue = new Queue("invoiceQueue",
  {
    connection:{
      url:process.env.REDIS_URL,
      tls: {},
    },
    skipNetworkCheck: true,
  }
);

export default invoiceQueue;