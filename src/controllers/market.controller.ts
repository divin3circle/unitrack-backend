import { Request, Response } from 'express';
import { MarketService } from '../services/market.service';
import { AuthenticatedRequest } from '../middlewares/auth';

export class MarketController {
  static async search(req: AuthenticatedRequest, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) return res.status(400).json({ error: 'Search query is required' });

      const results = await MarketService.search(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDetails(req: AuthenticatedRequest, res: Response) {
    try {
      const { ticker } = req.params;
      const details = await MarketService.getAssetDetails(ticker);
      
      if (!details) {
        return res.status(404).json({ error: 'Asset not found' });
      }
      
      res.json(details);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getPrice(req: AuthenticatedRequest, res: Response) {
    try {
      const { ticker } = req.params;
      const type = (req.query.type as 'stock' | 'crypto') || 'stock';
      
      const price = await MarketService.getCurrentPrice(ticker, type);
      
      if (price === null) {
        return res.status(404).json({ error: 'Price not found' });
      }
      
      res.json({ ticker, price, type });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getAggregates(req: AuthenticatedRequest, res: Response) {
    try {
      const { ticker } = req.params;
      const { from, to, timespan } = req.query;
      
      if (!from || !to) {
        return res.status(400).json({ error: 'from and to dates are required' });
      }
      
      const aggregates = await MarketService.getAggregates(
        ticker,
        from as string,
        to as string,
        (timespan as any) || 'day'
      );
      
      res.json({ ticker, aggregates });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
