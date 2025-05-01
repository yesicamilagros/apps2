import express from 'express';
import WebhookController from '../controllers/webhookController.js';

const router = express.Router();

router.post('/webhook', WebhookController.handleIncoming);
router.get('/webhook', WebhookController.verifyWebhook);

export default router;