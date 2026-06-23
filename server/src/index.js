import dotenv from "dotenv";

dotenv.config();

// start email worker
await import("./workers/email.worker.js");
// start invoice worker
await import("./workers/invoice.worker.js");
// start server
await import("./server.js");