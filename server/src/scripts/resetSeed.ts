import mongoose from 'mongoose';
import { env } from '../config/env';
import { Media } from '../models/Media';
import { Category } from '../models/Category';
import { seedDatabase } from './seed';

const run = async () => {
  try {
    console.log('[Reset Seed] Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('[Reset Seed] Deleting old media & categories...');
    await Media.deleteMany({});
    await Category.deleteMany({});
    console.log('[Reset Seed] Running seed database script...');
    await seedDatabase();
    await mongoose.disconnect();
    console.log('[Reset Seed] SUCCESSFULLY COMPLETED!');
    process.exit(0);
  } catch (err) {
    console.error('[Reset Seed Error]', err);
    process.exit(1);
  }
};

run();
