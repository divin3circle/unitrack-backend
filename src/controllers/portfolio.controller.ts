import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PortfolioService } from '../services/portfolio.service';

export class PortfolioController {
  static async getSummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const summary = await PortfolioService.getSummary(userId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAllocation(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const allocation = await PortfolioService.getAllocation(userId);
      res.json(allocation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getHoldings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const holdings = await PortfolioService.getHoldings(userId);
      res.json(holdings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      // TODO: Implement actual historical data fetch from PortfolioSnapshot
      res.json({ range: req.query.range || '1M', data: [] });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
