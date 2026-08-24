import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Media } from '../models/Media';
import { Category } from '../models/Category';

export const purgeMediaDatabase = async (): Promise<void> => {
  try {
    console.log('[Purge Script] Connecting to MongoDB Atlas...');
    await mongoose.connect(env.MONGODB_URI);

    console.log('[Purge Script] Deleting all media assets & categories...');
    const deletedMedia = await Media.deleteMany({});
    const deletedCat = await Category.deleteMany({});
    console.log(`[Purge Script] Successfully deleted ${deletedMedia.deletedCount} media items and ${deletedCat.deletedCount} categories.`);

    // Ensure Admin user exists for logging in and uploading
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      await User.create({
        name: 'FrameTrail Admin',
        email: 'admin@frametrail.com',
        password: 'adminpassword123',
        role: 'admin',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      });
      console.log('[Purge Script] Created default Admin user (admin@frametrail.com / adminpassword123)');
    }

    console.log('[Purge Script] Database is now 100% CLEAN (0 media items). Ready for custom uploads!');
  } catch (error: any) {
    console.error('[Purge Error]', error);
  } finally {
    await mongoose.disconnect();
  }
};

purgeMediaDatabase();
