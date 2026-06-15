import app from "./app.js";
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import { createSuperAdmin } from "./utils/superAdminHelper.js";

const PORT = process.env.PORT || 5000;

await connectDB();
await connectRedis();
await createSuperAdmin();

app.listen(PORT,()=>{
  console.log(`Server running on port ${PORT}`);
});