// Simple in-memory cache
class Cache {
  constructor(ttlMinutes = 15) {
    this.cache = new Map();
    this.ttl = ttlMinutes * 60 * 1000; // Convert to milliseconds
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const data = this.cache.get(key);
    if (!data) return null;

    const age = Date.now() - data.timestamp;
    if (age > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return data.value;
  }

  clear() {
    this.cache.clear();
  }
}

// Create cache instances
export const newsCache = new Cache(15);  // 15 minutes TTL
export const analysisCache = new Cache(15);  // 15 minutes TTL 