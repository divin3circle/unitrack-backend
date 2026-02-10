import { Router } from 'express';
import { MarketController } from '../controllers/market.controller';

const router = Router();

router.get('/search', MarketController.search);
router.get('/assets/:ticker', MarketController.getDetails);

export default router;
