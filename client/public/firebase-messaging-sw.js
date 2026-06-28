
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");

importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyBXLL-lMGWx2Ui9YeyOjClzw323UpsJbCs",
  authDomain: "vendorsphere-181c8.firebaseapp.com",
  projectId: "vendorsphere-181c8",
  storageBucket: "vendorsphere-181c8.firebasestorage.app",
  messagingSenderId: "78605486092",
  appId: "1:78605486092:web:4712e22edca76f5f818629",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(
  (payload) => {
    
    self.registration.showNotification(
      payload.data.title,
      {
        body: payload.data.body,
        data: {
          url : payload.data.url,
          orderId: payload.data.orderId,
          type: payload.data.type,
        },
      }
    );
  }
);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url;
  if (!url) return;
  event.waitUntil(
    clients.openWindow(url)
  );
});