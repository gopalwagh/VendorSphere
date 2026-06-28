import { Worker } from "bullmq";
// Queue jobs store Worker execute jobs
import sendEmail from "../services/sendEmail.js";

const emailWorker = new Worker("emailQueue", async(job) => 
  {
    try{ 
      const { to, subject, html,} = job.data;
      await sendEmail({
        to, subject, html,
      }); 
      console.log("Email sent SuccessFully"); 
    }catch(error){
      console.error("Email Error:", error);
    }
  },
  {
    connection :{
      url: process.env.REDIS_URL,
      tls: {
        rejectUnauthorized: false
      },
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
);

export default emailWorker;