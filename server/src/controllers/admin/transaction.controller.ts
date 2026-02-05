import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';

// Get All Transactions
export const getAllTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { paymentStatus, paymentMethod, userId, page = 1, limit = 10 } = req.query;

    // Build filter
    const where: any = {};

    if (paymentStatus) {
      where.paymentStatus = paymentStatus;
    }

    if (paymentMethod) {
      where.paymentMethod = paymentMethod;
    }

    if (userId) {
      where.subscription = {
        userId: userId as string,
      };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Get transactions and total count
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        include: {
          subscription: {
            include: {
              user: {
                select: {
                  id: true,
                  surname: true,
                  otherNames: true,
                  email: true,
                  role: true,
                },
              },
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
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    logger.error('Get All Transactions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching transactions',
    });
  }
};

// Get Transaction by ID
export const getTransactionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findUnique({
      where: { id: id as string },
      include: {
        subscription: {
          include: {
            user: {
              select: {
                id: true,
                surname: true,
                otherNames: true,
                email: true,
                role: true,
                studentId: true,
                staffId: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                description: true,
                price: true,
                duration: true,
                features: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    logger.error('Get Transaction By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching transaction',
    });
  }
};
