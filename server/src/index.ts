import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';
import { seedDatabase } from './scripts/seed';

import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply API Rate Limiter
app.use('/api', apiLimiter);

// API Router
app.use('/api', routes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    storage: env.R2.BUCKET_NAME ? 'Cloudflare R2' : 'Simulated',
  });
});

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDB();
  
  // Auto-seeding disabled for custom user uploads
  /*
  if (env.NODE_ENV === 'development') {
    try {
      await seedDatabase();
    } catch (err) {
      console.warn('[Auto Seed Warning]', err);
    }
  }
  */

  app.listen(env.PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 FrameTrail Server running on http://localhost:${env.PORT}`);
    console.log(`📁 Environment: ${env.NODE_ENV}`);
    console.log(`☁️ Cloudflare R2 Bucket: ${env.R2.BUCKET_NAME}`);
    console.log(`==================================================`);
  });
};

startServer();
