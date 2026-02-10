import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

// Fix the controller import if I named it differently or stick to one
import { WalletController as Controller } from '../controllers/wallet.controller';

router.post('/', authMiddleware, Controller.connect);
router.post('/sync/:portfolioId', authMiddleware, Controller.sync);

export default router;
