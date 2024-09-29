require('dotenv').config();

export const MONGO_DB = process.env.MONGO_DB
export const NODE_ENV = process.env.NODE_ENV || 'development';