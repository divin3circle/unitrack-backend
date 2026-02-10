import { Router } from 'express';
import { ManualAssetController } from '../controllers/manual-asset.controller';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.post('/', authMiddleware, ManualAssetController.create);
router.get('/', authMiddleware, ManualAssetController.getAll);
router.put('/:id', authMiddleware, ManualAssetController.update);
router.delete('/:id', authMiddleware, ManualAssetController.delete);

export default router;
