import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const fixMovies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('[Fix Movies] Connected to MongoDB Atlas');

    const Media = mongoose.model('Media', new mongoose.Schema({}, { strict: false }));

    const result = await Media.updateMany(
      { type: { $in: ['movie', 'video'] }, url: { $regex: 'unsplash' } },
      { $set: { url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' } }
    );

    console.log('[Fix Movies] Update result:', result);
    process.exit(0);
  } catch (err) {
    console.error('[Fix Movies Error]', err);
    process.exit(1);
  }
};

fixMovies();
