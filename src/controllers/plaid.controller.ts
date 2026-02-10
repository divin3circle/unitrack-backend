import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PlaidService } from '../services/plaid.service';

export class PlaidController {
  static async createLinkToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const linkToken = await PlaidService.createLinkToken(userId);
      res.json({ linkToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async exchangePublicToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { publicToken, metadata } = req.body;
      await PlaidService.exchangePublicToken(userId, publicToken, metadata);
      
      res.json({ status: 'connected' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async createUpdateLinkToken(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { portfolioId } = req.params;
      const linkToken = await PlaidService.createUpdateLinkToken(userId, portfolioId);
      
      res.json({ linkToken });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
