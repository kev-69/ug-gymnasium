import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morganMiddleware from './middleware/morgan';
import logger from './utils/logger';
import adminAuthRoutes from './routes/admin/auth.routes';
import adminPlanRoutes from './routes/admin/plan.routes';
import adminUserRoutes from './routes/admin/user.routes';
import adminTransactionRoutes from './routes/admin/transaction.routes';
import adminSubscriptionRoutes from './routes/admin/subscription.routes';
import adminContactRoutes from './routes/admin/contact.routes';
import authRoutes from './routes/user/auth.routes';
import userPlanRoutes from './routes/user/plan.routes';
import userSubscriptionRoutes from './routes/user/subscription.routes';
import userPaymentRoutes from './routes/user/payment.routes';
import userTransactionRoutes from './routes/user/transaction.routes';
import contactRoutes from './routes/user/contact.routes';
import { startSubscriptionExpirationJob } from './jobs/subscriptionExpiration.job';
import { startPaymentCleanupJob } from './jobs/paymentCleanup.job';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

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
      welcome: '/',
      health: '/api/health',
      plans: '/api/plans',
    }
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/plans', userPlanRoutes);
app.use('/api/subscriptions', userSubscriptionRoutes);
app.use('/api/payments', userPaymentRoutes);
app.use('/api/transactions', userTransactionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/plans', adminPlanRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/transactions', adminTransactionRoutes);
app.use('/api/admin/subscriptions', adminSubscriptionRoutes);
app.use('/api/admin/contacts', adminContactRoutes);

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
  logger.info(`📝 User Subscriptions: /api/subscriptions`);
  logger.info(`💳 User Payments: /api/payments`);
  logger.info(`� User Transactions: /api/transactions`);
  logger.info(`📧 Contact Form: /api/contact`);  
  logger.info(`👑 Admin Auth: /api/admin/auth`);
  logger.info(`📊 Admin Plans: /api/admin/plans`);
  logger.info(`👥 Admin Users: /api/admin/users`);
  logger.info(`📋 Admin Subscriptions: /api/admin/subscriptions`);
  logger.info(`💸 Admin Transactions: /api/admin/transactions`);  
  // Start cron jobs
  startSubscriptionExpirationJob();
  startPaymentCleanupJob();
});

export default app;
