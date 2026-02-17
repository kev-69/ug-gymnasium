import { Router } from 'express';
import {
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
  getContactStats,
} from '../../controllers/admin/contact.controller';
import { authenticateAdmin } from '../../middleware/auth.middleware';

const router = Router();

// All routes require admin authentication
router.use(authenticateAdmin);

/**
 * @route   GET /api/admin/contacts/stats
 * @desc    Get contact statistics
 * @access  Admin
 */
router.get('/stats', getContactStats);

/**
 * @route   GET /api/admin/contacts
 * @desc    Get all contact messages with pagination and filtering
 * @access  Admin
 * @query   page, limit, status, search, sortBy, sortOrder
 */
router.get('/', getAllContacts);

/**
 * @route   GET /api/admin/contacts/:id
 * @desc    Get a single contact message by ID
 * @access  Admin
 */
router.get('/:id', getContactById);

/**
 * @route   PATCH /api/admin/contacts/:id
 * @desc    Update contact status
 * @access  Admin
 */
router.patch('/:id', updateContactStatus);

/**
 * @route   DELETE /api/admin/contacts/:id
 * @desc    Delete a contact message
 * @access  Admin
 */
router.delete('/:id', deleteContact);

export default router;
