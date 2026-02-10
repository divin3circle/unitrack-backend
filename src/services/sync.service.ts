import plaidClient from '../config/plaid';
import prisma from '../config/database';
import { decrypt } from '../utils/encryption';
import { InvestmentsHoldingsGetRequest } from 'plaid';

export class SyncService {
  static async syncPlaidItem(portfolioId: string): Promise<void> {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio || !portfolio.accessToken) throw new Error('Plaid portfolio not found');

    const accessToken = decrypt(portfolio.accessToken);

    const request: InvestmentsHoldingsGetRequest = {
      access_token: accessToken,
    };

    const response = await plaidClient.investmentsHoldingsGet(request);
    const { holdings, securities } = response.data;

    // 1. Clear old holdings for this portfolio
    await prisma.holding.deleteMany({ where: { portfolioId: portfolio.id } });

    // 2. Update Holdings
    let totalValue = 0;
    for (const hold of holdings) {
      const security = securities.find((s) => s.security_id === hold.security_id);
      const value = hold.quantity * (hold.institution_price || security?.close_price || 0);
      totalValue += value;

      await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          name: security?.name || 'Unknown Security',
          ticker: security?.ticker_symbol,
          quantity: hold.quantity,
          costBasis: hold.cost_basis,
          currentPrice: hold.institution_price || security?.close_price || 0,
          value: value,
          type: security?.type?.toUpperCase() || 'STOCK',
        },
      });
    }

    // 3. Create History Snapshot
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue,
      },
    });

    // Update last synced
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { lastSynced: new Date() },
    });

    // 4. Trigger aggregated user snapshot
    const { AggregationService } = await import('./aggregation.service.js');
    await AggregationService.createUserSnapshot(portfolio.userId);
  }
}
