import NodeCache from "node-cache";

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false, // Better performance, but be careful with object mutations
});

// Cache keys constants
export const CACHE_KEYS = {
  CAMPUS_STATS: "campus_stats",
  USER_PROFILE: (userId) => `user_profile_${userId}`,
  EVENTS_LIST: "events_list",
  POSTS_FEED: (filter) => `posts_feed_${filter || "all"}`,
  BUS_SCHEDULE: "bus_schedule",
  HOLIDAYS: "holidays",
  BLOOD_DONORS: "blood_donors",
  JOBS_LIST: "jobs_list",
  HOUSING_LIST: "housing_list",
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 120, // 2 minutes - for frequently changing data
  MEDIUM: 300, // 5 minutes - for moderately changing data
  LONG: 3600, // 1 hour - for rarely changing data
  VERY_LONG: 86400, // 24 hours - for static data
};

// Get data from cache
export const getCache = (key) => {
  try {
    const value = cache.get(key);
    if (value) {
      console.log(`✅ Cache HIT: ${key}`);
      return value;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error("Cache get error:", error);
    return null;
  }
};

// Set data in cache
export const setCache = (key, value, ttl = CACHE_TTL.MEDIUM) => {
  try {
    cache.set(key, value, ttl);
    console.log(`💾 Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error("Cache set error:", error);
    return false;
  }
};

// Delete specific cache key
export const deleteCache = (key) => {
  try {
    cache.del(key);
    console.log(`🗑️  Cache DELETE: ${key}`);
    return true;
  } catch (error) {
    console.error("Cache delete error:", error);
    return false;
  }
};

// Delete multiple cache keys
export const deleteCachePattern = (pattern) => {
  try {
    const keys = cache.keys();
    const matchingKeys = keys.filter((key) => key.includes(pattern));
    cache.del(matchingKeys);
    console.log(
      `🗑️  Cache DELETE pattern: ${pattern} (${matchingKeys.length} keys)`
    );
    return true;
  } catch (error) {
    console.error("Cache delete pattern error:", error);
    return false;
  }
};

// Clear all cache
export const clearCache = () => {
  try {
    cache.flushAll();
    console.log("🗑️  Cache CLEARED");
    return true;
  } catch (error) {
    console.error("Cache clear error:", error);
    return false;
  }
};

// Get cache statistics
export const getCacheStats = () => {
  return cache.getStats();
};

// Middleware to cache GET requests
export const cacheMiddleware = (ttl = CACHE_TTL.MEDIUM) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    // Create cache key from URL and query params
    const cacheKey = `route_${req.originalUrl}`;

    // Try to get from cache
    const cachedData = getCache(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json to cache the response
    res.json = (data) => {
      setCache(cacheKey, data, ttl);
      return originalJson(data);
    };

    next();
  };
};

export default cache;
