import Redis from 'ioredis';

let redis: Redis | null = null;

export const initRedis = () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn('REDIS_URL not set, refresh token blacklist disabled');
    return null;
  }
  try {
    redis = new Redis(redisUrl);
    console.log('Redis connected');
    return redis;
  } catch (err) {
    console.error('Redis connection failed:', err);
    return null;
  }
};

export const getRedis = () => redis;

// Add token to blacklist (for logout)
export const blacklistToken = async (token: string, expiresIn: number) => {
  if (!redis) return;
  try {
    await redis.setex(`blacklist:${token}`, expiresIn, '1');
  } catch (err) {
    console.error('Failed to blacklist token:', err);
  }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  if (!redis) return false;
  try {
    const result = await redis.exists(`blacklist:${token}`);
    return result === 1;
  } catch (err) {
    console.error('Failed to check token blacklist:', err);
    return false;
  }
};

// Cache helper
export const setCache = async (key: string, value: any, ttl: number = 300) => {
  if (!redis) return;
  try {
    await redis.setex(`cache:${key}`, ttl, JSON.stringify(value));
  } catch (err) {
    console.error('Cache set error:', err);
  }
};

export const getCache = async (key: string) => {
  if (!redis) return null;
  try {
    const data = await redis.get(`cache:${key}`);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error('Cache get error:', err);
    return null;
  }
};

export const deleteCache = async (key: string) => {
  if (!redis) return;
  try {
    await redis.del(`cache:${key}`);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
};
