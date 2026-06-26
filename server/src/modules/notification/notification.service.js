import { getMessaging } from "firebase-admin/messaging";
import User from "../user/user.model.js";

export const sendPushNotification = async(  
  userId, 
  fcmToken, 
  title, 
  body,
  data ={}, 
) => {
  try{
    const response = await getMessaging().send({
      token: fcmToken,
      webpush: {
        notification: {
          title,
          body,
        },
        fcmOptions: {
          link: `http://localhost:5173${data.url}`,
        },
      },
      data: {
        ...data,
      },
    });
    
  } catch( error){
    console.error("FCM error", error.code);
    if(error.code==="messaging/registration-token-not-registered"){
      await User.findByIdAndUpdate( userId, { $set: { fcmToken: null, }, } );
    }
    console.log("Invalid FCM token removed");
    return;
  }
};
