import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { WalletService } from '../services/wallet.service';

export class WalletController {
  static async connect(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { address, label } = req.body;
      if (!address || !label) {
        return res.status(400).json({ error: 'Address and label are required' });
      }

      const portfolio = await WalletService.connectWallet(userId, address, label);
      res.status(201).json(portfolio);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async sync(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'User not authenticated' });

      const { portfolioId } = req.params;
      await WalletService.syncWallet(portfolioId);
      res.json({ status: 'success' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
