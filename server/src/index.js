import dotenv from "dotenv";

dotenv.config();

// start worker
import "./workers/email.worker.js";
// start server
import("./server.js");