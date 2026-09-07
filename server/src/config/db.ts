import mongoose from 'mongoose';
import { env } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[Database Warning] Could not connect to primary MongoDB: ${error.message}`);
    console.log('[Database] Falling back to Memory/Mock Store mode if MongoDB is not running locally.');
  }
};
