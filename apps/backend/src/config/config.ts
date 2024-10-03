require('dotenv').config();

export const REDIS_EXPIRY_TIME = 3600;
export const MONGO_DB = process.env.MONGO_DB
export const REDIS = process.env.REDIS
export const REDIS_TOKEN = process.env.REDIS_TOKEN;
export const AMQP = process.env.AMQP || ""
export const NODE_ENV = process.env.NODE_ENV || 'development';