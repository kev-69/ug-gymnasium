import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morganMiddleware from './middleware/morgan';
import logger from './utils/logger';

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
  res.json({ message: 'UG Gymnasium API is running!' });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV}`);
});

export default app;
