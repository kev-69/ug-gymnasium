import { Request, Response } from 'express';
import emailService from '../../utils/email';
import logger from '../../utils/logger';
import prisma from '../../config/database';
import { ContactInput } from '../../validators/user/contact.validator';

/**
 * Handle contact form submission
 */
export const sendContactMessage = async (
  req: Request<{}, {}, ContactInput>,
  res: Response
) => {
  try {
    const { name, email, subject, message } = req.body;

    logger.info(`Processing contact form submission from ${email}`);

    // Save contact message to database
    const contact = await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'NEW',
      },
    });

    logger.info(`Contact message saved to database with ID: ${contact.id}`);

    // Try to send email to admin (optional - don't fail if this doesn't work)
    try {
      await emailService.sendContactEmail({
        name,
        email,
        subject,
        message,
      });
      logger.info('Contact email sent to admin');
    } catch (emailError) {
      logger.warn('Failed to send contact email to admin (message saved to database):', emailError);
      // Don't fail the request - message is saved in database
    }

    logger.info(`Contact form submission processed successfully for ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Message sent successfully! We will get back to you soon.',
      data: {
        contactId: contact.id,
      },
    });
  } catch (error) {
    logger.error('Error in sendContactMessage:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while sending your message. Please try again later.',
    });
  }
};
