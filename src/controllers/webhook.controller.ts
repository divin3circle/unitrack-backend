import { Request, Response } from 'express';
import { SyncService } from '../services/sync.service';
import prisma from '../config/database';

export class WebhookController {
  static async handlePlaidWebhook(req: Request, res: Response) {
    const { webhook_type, webhook_code, item_id } = req.body;

    console.log(`[Plaid Webhook] Type: ${webhook_type}, Code: ${webhook_code}, Item: ${item_id}`);

    try {
      const portfolio = await prisma.portfolio.findUnique({
        where: { plaidItemId: item_id },
      });

      if (!portfolio) {
        console.warn(`Portfolio not found for webhook: ${item_id}`);
        return res.status(200).json({ status: 'ignored' });
      }

      switch (webhook_type) {
        case 'HOLDINGS':
          if (webhook_code === 'DEFAULT_UPDATE' || webhook_code === 'HISTORICAL_UPDATE') {
            await SyncService.syncPlaidItem(portfolio.id);
          }
          break;

        case 'ITEM':
          if (webhook_code === 'LOGIN_REQUIRED') {
            await prisma.portfolio.update({
              where: { id: portfolio.id },
              data: { status: 'NEEDS_REAUTH' },
            });
          }
          break;

        default:
          console.log(`Unhandled webhook type: ${webhook_type}`);
      }

      res.json({ status: 'processed' });
    } catch (error: any) {
      console.error(`Error processing Plaid webhook: ${error.message}`);
      res.status(500).json({ error: error.message });
    }
  }
}
