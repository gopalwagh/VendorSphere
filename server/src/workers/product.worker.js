import { Worker } from "bullmq";
import Product from "../modules/product/product.model.js";
import { invalidateProductCache } from "../utils/redisHelper.js";

const productWorker = new Worker('productQueue',
  async(job) => {
    if(job.name === "bulkImportJob"){
      const { sellerId, products } = job.data;
      try {
        console.log(`[Queue] Starting smart bulk import (No Duplicates) for Seller: ${sellerId}`);

        //1 prepare bulk Operation array
        const bulkOps = products.map((item) => ({
          updateOne: {
            // match condition: same seller aur same product tittle
            filter: { 
              title: item.title, 
              createdBy: sellerId 
            },
            // action: data update karo ya insert karo
            update: { $set: item },
            // Agar nahi mila toh naya create kar denge(Upsert)
            upsert: true
          }
        }));
        // 2 Execute Bulk Write (Bahot fast hota hai )
        const result = await Product.bulkWrite(bulkOps);
        // 3 Cache clear 
        await invalidateProductCache();

        console.log(`[Queue] ✅ Import Complete. Inserted: ${result.upsertedCount}, Updated: ${result.modifiedCount}`);
      } catch(error) {
        console.error(`[Queue] ❌ Bulk import failed for Seller: ${sellerId}`, error);
        throw error;
      }
    }
  },
  {
    connection :{
      url: process.env.REDIS_URL,
    },
    skipNetworkCheck: true,
    suppressVersionCheck: true,
  }
);

export default productWorker;