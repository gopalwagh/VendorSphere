import { Worker } from "bullmq";
import User from "../modules/user/user.model.js";
import { sendPushNotification } from "../modules/notification/notification.service.js";

const notificationWorker = new Worker(
  "notificationQueue", async(job)=> {
    const { 
      userId, 
      notificationTitle, 
      notificationBody, 
      notificationData
    } = job.data;
    // database se user fetch for fcmToken
    const user = await User.findById(userId);
    // not exist return;
    if(!user?.fcmToken) return;

    await sendPushNotification(
      userId,
      user.fcmToken,
      notificationTitle,
      notificationBody,
      notificationData,
    )
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
  
)

export default notificationWorker;