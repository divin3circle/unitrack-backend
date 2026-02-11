import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Specific routes MUST come before dynamic routes
router.get('/', authMiddleware, PortfolioController.getAllPortfolios);
router.get('/summary', authMiddleware, PortfolioController.getSummary);
router.get('/allocation', authMiddleware, PortfolioController.getAllocation);
router.get('/holdings', authMiddleware, PortfolioController.getHoldings);
router.get('/history', authMiddleware, PortfolioController.getHistory);
// Dynamic route comes last
router.get('/:id', authMiddleware, PortfolioController.getPortfolioById);

export default router;
