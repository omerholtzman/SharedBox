import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const env = process.env.NODE_ENV || 'development';

let envFile = '.env';
if (env === 'development') {
  envFile = '.dev.env';
} else if (env === 'test') {
  envFile = '.test.env';
}

dotenv.config({ path: path.resolve(process.cwd(), envFile) });

const configSchema = z.object({
  PORT: z.coerce.number().min(1),
  MONGO_URI: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRE_TIME: z.string(),
  CORS_ORIGIN: z.string(),
});

const config = configSchema.parse({
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE_TIME: process.env.JWT_EXPIRE_TIME,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

export default config;
