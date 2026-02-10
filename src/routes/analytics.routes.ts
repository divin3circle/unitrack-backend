import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/health', authMiddleware, AnalyticsController.getHealth);
router.post('/chat', authMiddleware, AnalyticsController.chat);

export default router;
