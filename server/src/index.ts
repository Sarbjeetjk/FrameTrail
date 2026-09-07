import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware';
import { apiLimiter } from './middleware/rateLimiter';

const app = express();

// Security HTTP Headers (Clickjacking, MIME Sniffing, HSTS protection)
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply API Rate Limiter
app.use('/api', apiLimiter);

// API Router
app.use('/api', routes);

// Root Welcome Route & Health Checks
app.get(['/', '/health', '/api/health'], (req, res) => {
  res.status(200).json({
    status: 'ok',
    success: true,
    message: '🚀 FrameTrail API Server is Live, Awake & Healthy!',
    timestamp: new Date().toISOString(),
    env: env.NODE_ENV,
    storage: 'Cloudinary Cloud Storage',
  });
});

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Render Anti-Cold-Start Keep-Alive Engine (Pings every 14 minutes to prevent Render sleep)
const startKeepAliveEngine = () => {
  if (process.env.NODE_ENV !== 'production' && !process.env.RENDER) return;
  const SERVER_URL = process.env.RENDER_EXTERNAL_URL || 'https://frametrail-q72w.onrender.com';
  const PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

  console.log(`[Keep-Alive Engine] Active - Pinging ${SERVER_URL}/health every 14 minutes`);
  setInterval(async () => {
    try {
      const response = await fetch(`${SERVER_URL}/health`);
      console.log(`[Keep-Alive Ping] Auto-Pinged ${SERVER_URL}/health - Status: ${response.status}`);
    } catch (error: any) {
      console.error(`[Keep-Alive Ping Error]`, error.message);
    }
  }, PING_INTERVAL);
};

const startServer = async () => {
  await connectDB();

  app.listen(env.PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 FrameTrail Server running on http://localhost:${env.PORT}`);
    console.log(`📁 Environment: ${env.NODE_ENV}`);
    console.log(`☁️ Cloudflare R2 Bucket: ${env.R2.BUCKET_NAME}`);
    console.log(`⚡ Keep-Alive Engine: Pinging every 14 mins`);
    console.log(`==================================================`);
    startKeepAliveEngine();
  });
};

startServer();
