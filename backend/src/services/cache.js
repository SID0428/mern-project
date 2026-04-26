const Redis = require('ioredis');
const { redisUrl } = require('../config/env');

let redisClient;
const memoryCache = new Map();

function getRedisClient() {
  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });
    redisClient.on('error', () => {});
  }
  return redisClient;
}

async function getCache(key) {
  try {
    const cached = await getRedisClient().get(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    const entry = memoryCache.get(key);
    if (!entry || entry.expiresAt < Date.now()) {
      memoryCache.delete(key);
      return null;
    }
    return entry.value;
  }
}

async function setCache(key, value, ttlSeconds = 300) {
  try {
    await getRedisClient().set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {
    memoryCache.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }
}

async function clearCacheByPrefix(prefix) {
  try {
    const keys = await getRedisClient().keys(`${prefix}*`);
    if (keys.length) await getRedisClient().del(keys);
  } catch {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  }
}

module.exports = { getCache, setCache, clearCacheByPrefix };
