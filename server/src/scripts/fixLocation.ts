import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const res = await mongoose.connection.collection('activitylogs').updateMany(
    {
      $or: [
        { location: 'New Delhi, India' },
        { location: { $regex: /New Delhi/i } },
        { ip: '103.211.54.12' },
      ],
    },
    {
      $set: {
        location: 'Chandigarh, India',
        coordinates: { lat: 30.7363, lng: 76.7884 },
        ip: '2409:40d1:42e:9b1f:95c:289f:b0fe:d676',
        isp: 'Reliance Jio Infocomm Limited',
      },
    }
  );
  console.log('UPDATED LOGS TO CHANDIGARH:', res.modifiedCount);
  await mongoose.disconnect();
}

main();
