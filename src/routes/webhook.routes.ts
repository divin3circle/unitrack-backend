import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

router.post('/plaid', WebhookController.handlePlaidWebhook);

export default router;
