import dotenv from 'dotenv';
dotenv.config();
const isProduction = process.env.NODE_ENV === 'production';
const requireEnv = (key: string) => {
  const val = process.env[key];
  if (!val || !val.trim()) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT ? Number(process.env.PORT) : 5000,
  CLIENT_URL: process.env.CLIENT_URL || '',
  MONGO_URI: process.env.MONGO_URI || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY || '',
};
export const validateEnvOrThrow = () => {
  if (!isProduction) return;
  requireEnv('MONGO_URI');
  requireEnv('FIREBASE_PROJECT_ID');
  requireEnv('FIREBASE_CLIENT_EMAIL');
  requireEnv('FIREBASE_PRIVATE_KEY');
};
