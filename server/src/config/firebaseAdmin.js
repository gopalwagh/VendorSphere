import { initializeApp, cert } from "firebase-admin/app";

import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync(
    new URL(
      "./firebase-admin.json",
      import.meta.url
    )
  )
);

initializeApp({
  credential: cert(serviceAccount),
});

