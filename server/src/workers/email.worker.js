import { Worker } from "bullmq";
// Queue jobs store Worker execute jobs
import sendEmail from "../services/sendEmail.js";

const emailWorker = new Worker("emailQueue", async(job) => 
  {
    const { to, subject, html,} = job.data;
    await sendEmail({
      to, subject, html,
    }); 
    console.log("Email sent SuccessFully"); 
  },
  {
    connection :{
      url: process.env.REDIS_URL,
    },
  }
);

export default emailWorker;