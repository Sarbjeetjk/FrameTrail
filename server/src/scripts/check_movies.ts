import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const checkMoviesInAtlas = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('==================================================');
    console.log('[MongoDB Atlas Status] Connected to Online Cloud Database');
    console.log('==================================================');

    const Media = mongoose.model('Media', new mongoose.Schema({}, { strict: false }));

    const allMedia = await Media.find({});
    const movies = await Media.find({ type: 'movie' });
    const photos = await Media.find({ type: 'photo' });
    const videos = await Media.find({ type: 'video' });

    console.log(`📊 TOTAL ITEMS IN ONLINE DATABASE: ${allMedia.length}`);
    console.log(`🎬 TOTAL MOVIES: ${movies.length}`);
    console.log(`📸 TOTAL PHOTOS: ${photos.length}`);
    console.log(`🎥 TOTAL SHORT VIDEOS: ${videos.length}`);
    console.log('--------------------------------------------------');

    if (movies.length === 0) {
      console.log('⚠️ No movies found in MongoDB Atlas cloud database yet.');
    } else {
      console.log('🍿 MOVIES STORED IN ONLINE MONGODB ATLAS DATABASE:');
      movies.forEach((m: any, idx: number) => {
        console.log(`\n[Movie #${idx + 1}]`);
        console.log(`- ID: ${m._id}`);
        console.log(`- Title: "${m.title}"`);
        console.log(`- Category: ${m.category}`);
        console.log(`- Type: ${m.type}`);
        console.log(`- Video URL: ${m.url}`);
        console.log(`- R2 Key: ${m.r2Key}`);
        console.log(`- Created At: ${m.createdAt}`);
      });
    }

    console.log('==================================================');
    process.exit(0);
  } catch (err) {
    console.error('[MongoDB Atlas Check Error]', err);
    process.exit(1);
  }
};

checkMoviesInAtlas();
