import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/frametrail',
  JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_token_key_frametrail_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  R2: {
    ACCOUNT_ID: process.env.R2_ACCOUNT_ID || '',
    ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID || '',
    SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY || '',
    BUCKET_NAME: process.env.R2_BUCKET_NAME || 'frametrail-media',
    PUBLIC_DOMAIN: process.env.R2_PUBLIC_DOMAIN || '',
  },
};
