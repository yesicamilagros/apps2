import express from 'express';
import WebhookController from '../controllers/messageHandler.js';

const router = express.Router();

router.post('/webhook', WebhookController.handleIncoming);
router.get('/webhook', WebhookController.verifyWebhook);

export default router;