import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.get('/search', authMiddleware, MarketController.search);
router.get('/assets/:ticker', authMiddleware, MarketController.getDetails);
router.get('/assets/:ticker/price', authMiddleware, MarketController.getPrice);
router.get('/assets/:ticker/aggregates', authMiddleware, MarketController.getAggregates);

export default router;
