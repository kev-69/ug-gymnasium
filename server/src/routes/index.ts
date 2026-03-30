import { Express, Request, Response } from 'express';
import adminAuthRoutes from './admin/auth.routes';
import adminPlanRoutes from './admin/plan.routes';
import adminUserRoutes from './admin/user.routes';
import adminTransactionRoutes from './admin/transaction.routes';
import adminSubscriptionRoutes from './admin/subscription.routes';
import adminContactRoutes from './admin/contact.routes';
import authRoutes from './user/auth.routes';
import userPlanRoutes from './user/plan.routes';
import userSubscriptionRoutes from './user/subscription.routes';
import userPaymentRoutes from './user/payment.routes';
import userTransactionRoutes from './user/transaction.routes';
import contactRoutes from './user/contact.routes';

export const registerRoutes = (app: Express): void => {
  app.get('/', (req: Request, res: Response) => {
    res.json({
      message: 'UG Gymnasium API is running!',
      version: '1.0.0',
      endpoints: {
        welcome: '/',
        health: '/api/health',
        plans: '/api/plans',
      },
    });
  });

  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

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
};