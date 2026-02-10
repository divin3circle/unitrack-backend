import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/summary', authMiddleware, PortfolioController.getSummary);
router.get('/allocation', authMiddleware, PortfolioController.getAllocation);
router.get('/holdings', authMiddleware, PortfolioController.getHoldings);
router.get('/history', authMiddleware, PortfolioController.getHistory);

export default router;
