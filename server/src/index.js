import dotenv from "dotenv";

dotenv.config();

await import("./config/firebaseAdmin.js");
// start email worker
await import("./workers/email.worker.js");
// start invoice worker
await import("./workers/invoice.worker.js");
// start notification worker
await import("./workers/notification.worker.js");

// start server
await import("./server.js");