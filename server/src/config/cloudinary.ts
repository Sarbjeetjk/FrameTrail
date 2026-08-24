import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'hp9yaqze',
  api_key: process.env.CLOUDINARY_API_KEY || '548995455731727',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'UcMpRCTQmhmPpPUttz1OkMic_u4',
  secure: true,
});

export default cloudinary;
