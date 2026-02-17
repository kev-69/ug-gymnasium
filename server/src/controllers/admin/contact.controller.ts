import { Request, Response } from 'express';
import prisma from '../../config/database';
import logger from '../../utils/logger';
import { ContactStatus } from '@prisma/client';

/**
 * Get all contact messages with pagination, filtering, and sorting
 */
export const getAllContacts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = status as ContactStatus;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { subject: { contains: search as string, mode: 'insensitive' } },
        { message: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const totalContacts = await prisma.contact.count({ where });

    // Get contacts
    const contacts = await prisma.contact.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
    });

    // Get status counts for filters
    const statusCounts = await prisma.contact.groupBy({
      by: ['status'],
      _count: true,
    });

    const totalPages = Math.ceil(totalContacts / limitNum);

    res.status(200).json({
      success: true,
      data: {
        contacts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalContacts,
          limit: limitNum,
        },
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr.status] = curr._count;
          return acc;
        }, {} as Record<string, number>),
      },
    });
  } catch (error) {
    logger.error('Error in getAllContacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact messages',
    });
  }
};

/**
 * Get a single contact message by ID
 */
export const getContactById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: id as string },
    });

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    // If the status is NEW, mark it as READ
    if (contact.status === ContactStatus.NEW) {
      await prisma.contact.update({
        where: { id: id as string },
        data: { status: ContactStatus.READ },
      });
      contact.status = ContactStatus.READ;
    }

    res.status(200).json({
      success: true,
      data: contact,
    });
  } catch (error) {
    logger.error('Error in getContactById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact message',
    });
  }
};

/**
 * Update contact status
 */
export const updateContactStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, responseNotes } = req.body;

    const contact = await prisma.contact.findUnique({
      where: { id: id as string },
    });

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    const updateData: any = { status };

    if (responseNotes !== undefined) {
      updateData.responseNotes = responseNotes;
    }

    if (status === ContactStatus.RESPONDED) {
      updateData.respondedAt = new Date();
      updateData.respondedBy = req.admin?.email || 'Admin';
    }

    const updatedContact = await prisma.contact.update({
      where: { id: id as string },
      data: updateData,
    });

    logger.info(`Contact ${id} status updated to ${status} by ${req.admin?.email}`);

    res.status(200).json({
      success: true,
      message: 'Contact status updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    logger.error('Error in updateContactStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update contact status',
    });
  }
};

/**
 * Delete a contact message
 */
export const deleteContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findUnique({
      where: { id: id as string },
    });

    if (!contact) {
      res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
      return;
    }

    await prisma.contact.delete({
      where: { id: id as string },
    });

    logger.info(`Contact ${id} deleted by ${req.admin?.email}`);

    res.status(200).json({
      success: true,
      message: 'Contact message deleted successfully',
    });
  } catch (error) {
    logger.error('Error in deleteContact:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete contact message',
    });
  }
};

/**
 * Get contact statistics
 */
export const getContactStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalContacts = await prisma.contact.count();
    const newContacts = await prisma.contact.count({
      where: { status: ContactStatus.NEW },
    });
    const readContacts = await prisma.contact.count({
      where: { status: ContactStatus.READ },
    });
    const respondedContacts = await prisma.contact.count({
      where: { status: ContactStatus.RESPONDED },
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalContacts,
        new: newContacts,
        read: readContacts,
        responded: respondedContacts,
      },
    });
  } catch (error) {
    logger.error('Error in getContactStats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact statistics',
    });
  }
};
