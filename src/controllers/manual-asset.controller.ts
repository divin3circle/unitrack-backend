import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { ManualAssetService } from '../services/manual-asset.service';

export class ManualAssetController {
  static async create(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const result = await ManualAssetService.create(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const portfolios = await ManualAssetService.getAll(userId);
      res.json(portfolios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { id } = req.params;
      const { value, date } = req.body;
      const result = await ManualAssetService.updateValue(userId, id, { value, date });
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { id } = req.params;
      await ManualAssetService.delete(userId, id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
