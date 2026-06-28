import { onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const initializeForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    const title = 
      payload.notification?.title || 
      payload.data?.title;

    const body = 
      payload.notification?.body ||
      payload.data?.body;
      
    const url = payload.data?.url;  

    const notification = new Notification(
      title, { 
        body, 
      });

    notification.onclick = () => {
      if(url){
        window.open(url, "_self");
      }
    };
  });
};