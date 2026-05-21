import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";

dotenv.config({ path: "./.env" });

const PORT = process.env.PORT || 5000;

await connectDB();
await connectRedis();

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});