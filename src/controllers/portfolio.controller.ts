import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PortfolioService } from '../services/portfolio.service';

export class PortfolioController {
  static async getAllPortfolios(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const portfolios = await PortfolioService.getAllPortfolios(userId);
      res.json(portfolios);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPortfolioById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { id } = req.params;
      const portfolio = await PortfolioService.getPortfolioById(userId, id);
      
      if (!portfolio) {
        return res.status(404).json({ error: 'Portfolio not found' });
      }
      
      res.json(portfolio);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

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

      const range = (req.query.range as string) || '1M';
      const history = await PortfolioService.getHistory(userId, range);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
