import mongoose from 'mongoose';
import { env } from '../config/env';
import { User } from '../models/User';
import { Media } from '../models/Media';
import { Category } from '../models/Category';
import { generatePhotoSeedData, VIDEO_SEED_DATA, MOVIE_SEED_DATA } from '../utils/seedData';

export const seedDatabase = async (): Promise<void> => {
  try {
    console.log('[Seed Script] Connecting to database...');
    await mongoose.connect(env.MONGODB_URI);

    console.log('[Seed Script] Checking existing media count...');
    const existingCount = await Media.countDocuments();

    if (existingCount > 0) {
      console.log(`[Seed Script] Database already contains ${existingCount} items. Skipping re-seed.`);
      return;
    }

    console.log('[Seed Script] Purging old records...');
    await User.deleteMany({});
    await Media.deleteMany({});
    await Category.deleteMany({});

    console.log('[Seed Script] Creating Admin and Standard User accounts...');
    const adminUser = await User.create({
      name: 'FrameTrail Admin',
      email: 'admin@frametrail.com',
      password: 'adminpassword123',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    });

    await User.create({
      name: 'Gallery Curator',
      email: 'user@frametrail.com',
      password: 'userpassword123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    });

    console.log('[Seed Script] Generating 500+ Photo records...');
    const photos = generatePhotoSeedData();

    console.log('[Seed Script] Combining Photos, Videos (25), and Movies (15)...');
    const allMedia = [...photos, ...VIDEO_SEED_DATA, ...MOVIE_SEED_DATA].map((item) => ({
      ...item,
      uploadedBy: adminUser._id,
    }));

    console.log(`[Seed Script] Inserting ${allMedia.length} total media items into MongoDB...`);
    // Insert in chunks of 100 for high performance
    const chunkSize = 100;
    for (let i = 0; i < allMedia.length; i += chunkSize) {
      const chunk = allMedia.slice(i, i + chunkSize);
      await Media.insertMany(chunk);
      console.log(`[Seed Script] Inserted batch ${Math.floor(i / chunkSize) + 1} of ${Math.ceil(allMedia.length / chunkSize)}`);
    }

    // Seed Categories
    const categoriesSet = new Set(allMedia.map((m) => m.category));
    const categories = Array.from(categoriesSet).map((cat) => ({
      name: cat,
      slug: cat.toLowerCase().replace(/\s+/g, '-'),
      description: `Curated collection of ${cat} media assets`,
    }));
    await Category.insertMany(categories);

    console.log('[Seed Script] Database successfully seeded!');
    console.log(`- Admin Login: admin@frametrail.com / adminpassword123`);
    console.log(`- User Login: user@frametrail.com / userpassword123`);
    console.log(`- Photos seeded: ${photos.length}`);
    console.log(`- Videos seeded: ${VIDEO_SEED_DATA.length}`);
    console.log(`- Movies seeded: ${MOVIE_SEED_DATA.length}`);
  } catch (error: any) {
    console.error('[Seed Error]', error);
  }
};

if (require.main === module) {
  seedDatabase().then(() => {
    mongoose.disconnect();
    process.exit(0);
  });
}
