import { Queue } from "bullmq";
/** bullmq library mai Queue namak class rehti hai */
// new Queue generated
// "emailQueue" was it unique name
const emailQueue = new Queue("emailQueue", {
  // it's actually telling where is redis server
  connection : {
    url:process.env.REDIS_URL,
    tls: {},  
  },
  skipNetworkCheck: true,
});

export default emailQueue;
