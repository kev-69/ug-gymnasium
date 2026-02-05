import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morganMiddleware from './middleware/morgan';
import logger from './utils/logger';
import authRoutes from './routes/auth.routes';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminPlanRoutes from './routes/admin/plan.routes';
import adminUserRoutes from './routes/admin/user.routes';
import adminTransactionRoutes from './routes/admin/transaction.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morganMiddleware);

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'UG Gymnasium API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      adminAuth: '/api/admin/auth',
      adminPlans: '/api/admin/plans',
      adminUsers: '/api/admin/users',
      adminTransactions: '/api/admin/transactions',
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);

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
  logger.info(`🔐 Auth routes: /api/auth`);
  logger.info(`👑 Admin routes: /api/admin/auth`);
  logger.info(`📋 Plan routes: /api/admin/plans`);
  logger.info(`👥 User routes: /api/admin/users`);
  logger.info(`💰 Transaction routes: /api/admin/transactions`);
});

export default app;
