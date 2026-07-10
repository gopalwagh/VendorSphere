import { Queue } from "bullmq";
// new copilotQueue generated
const copilotQueue = new Queue("copilotQueue", 
  {
    connection : {
      url:process.env.REDIS_URL,  
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
);

export default copilotQueue;