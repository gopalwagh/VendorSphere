import { Queue } from "bullmq";
// new queue for bulk product creation
const productQueue = new Queue('productQueue',{
  connection : {
    url:process.env.REDIS_URL,  
  },
  skipNetworkCheck: true,
  suppressVersionCheck: true,
})

export default productQueue;
