import { Request, Response } from 'express';
import { MarketService } from '../services/market.service';

export class MarketController {
  static async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string;
      if (!query) return res.status(400).json({ error: 'Search query is required' });

      const results = await MarketService.search(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getDetails(req: Request, res: Response) {
    try {
      const { ticker } = req.params;
      const details = await MarketService.getAssetDetails(ticker);
      res.json(details);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
