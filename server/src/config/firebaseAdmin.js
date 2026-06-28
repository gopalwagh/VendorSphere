import { initializeApp, cert } from "firebase-admin/app";

import fs from "fs";

let serviceAccount;

if(process.env.NODE_ENV === "production"){
  serviceAccount = { 
    projectId: process.env.FIREBASE_PROJECT_ID, clientEmail: process.env.FIREBASE_CLIENT_EMAIL, privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"), 

  };
} else {
  serviceAccount = JSON.parse(
    fs.readFileSync(
      new URL(
        "./firebase-admin.json",
        import.meta.url
      )
    )
  );
}

initializeApp({
  credential: cert(serviceAccount),
});

