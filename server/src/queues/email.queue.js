import { Queue } from "bullmq";
// new emailQueue generated
const emailQueue = new Queue("emailQueue", {
  // it's actually telling where is redis server
  connection : {
    url:process.env.REDIS_URL,  
  },
  skipNetworkCheck: true,
  suppressVersionCheck: true,
});

export default emailQueue;
