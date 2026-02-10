import { Router } from 'express';
import { PlaidController } from '../controllers/plaid.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/link-token', authMiddleware, PlaidController.createLinkToken);
router.post('/exchange', authMiddleware, PlaidController.exchangePublicToken);
router.post('/reauth/:portfolioId', authMiddleware, PlaidController.createUpdateLinkToken);

export default router;
