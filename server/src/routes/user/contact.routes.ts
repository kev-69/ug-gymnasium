import { Router } from 'express';
import { sendContactMessage } from '../../controllers/user/contact.controller';
import { validateRequest } from '../../middleware/validate.middleware';
import { contactSchema } from '../../validators/user/contact.validator';

const router = Router();

/**
 * @route   POST /api/contact
 * @desc    Send contact form message
 * @access  Public
 */
router.post('/', validateRequest(contactSchema), sendContactMessage);

export default router;
