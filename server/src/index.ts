import dotenv from 'dotenv';

// Load environment variables FIRST before other imports
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morganMiddleware from './middleware/morgan';
import logger from './utils/logger';
import { registerRoutes } from './routes';
import { startBackgroundJobs } from './jobs';

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

registerRoutes(app);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔐 User Auth: /api/auth`);
  logger.info(`📋 User Plans: /api/plans`);
  logger.info(`📧 Contact Form: /api/contact`);   
  // Start cron jobs
  startBackgroundJobs();
});

export default app;
