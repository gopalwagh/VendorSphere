import { redisClient } from "../config/redis.js";
/**
 * Redis se data nikalne ka global function
 */
export const getCachedData = async (cacheKey) => {
  try {
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    console.error(`Redis Get Error for key ${cacheKey}:`, error);
    return null; 
  }
};

/**
 * Redis mein data Smart TTL (Jitter) ke sath set karne ka global function
 */
export const setCachedData = async (cacheKey, data, baseTTL = 300) => {
  try {
    const jitter = Math.floor(Math.random() * 45); 
    const finalTTL = baseTTL + jitter;

    await redisClient.set(
      cacheKey,
      JSON.stringify(data),
      { EX: finalTTL }
    );
  } catch (error) {
    console.error(`Redis Set Error for key ${cacheKey}:`, error);
  }
};

/**
 * 3. Master Invalidation Function (Non-blocking SCAN method)
 */
export const invalidateProductCache = async (productId = null) => {
  try {
    
    if (productId) {
      await redisClient.del(`product:${productId}`);
      await redisClient.del(`reviews:${productId}`);
      console.log(`Specific cache cleared for Product ID: ${productId}`);
    }

    let cursor = '0';
    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: 'products:*',
        COUNT: 100
      });
      
      cursor = reply.cursor;
      const keys = reply.keys;

      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== '0');

    console.log("All Product List Caches Invalidated successfully!");
  } catch (error) {
    console.error("Error in master cache invalidation:", error);
  }
};

export const invalidateCartCache = async (userId) => {
  try {
    if (userId) {
      await redisClient.del(`cart:${userId}`);
      console.log(`[REDIS] Cart cache cleared for User ID: ${userId}`);
    }
  } catch (error) {
    console.error("Error in cart cache invalidation:", error);
  }
}