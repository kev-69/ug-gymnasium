import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { PaymentStatus } from '@prisma/client';

// Get User's Transaction History
export const getUserTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
      return;
    }

    // Parse query params
    const { status, limit = 20, offset = 0 } = req.query;

    // Build where clause
    const where: any = {
      subscription: {
        userId,
      },
    };

    if (status) {
      where.paymentStatus = status as PaymentStatus;
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          subscription: {
            include: {
              plan: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  duration: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        limit: Number(limit),
        offset: Number(offset),
        hasMore: Number(offset) + transactions.length < total,
      },
    });
  } catch (error) {
    logger.error('Get User Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching transactions',
    });
  }
};
