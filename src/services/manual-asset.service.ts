import prisma from '../config/database';

export interface ManualAssetData {
  name: string;
  type: string; // The type of the portfolio/asset (e.g., Real Estate)
  value: number;
  quantity?: number;
  ticker?: string;
  currency?: string;
  notes?: string;
}

export class ManualAssetService {
  static async create(userId: string, data: ManualAssetData) {
    // Each "Manual Asset" is treated as a Portfolio for history/tracking
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: data.name,
        type: 'MANUAL',
        status: 'ACTIVE',
      },
    });

    const holding = await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        name: data.name,
        ticker: data.ticker,
        quantity: data.quantity ?? 1,
        currentPrice: data.value / (data.quantity ?? 1),
        value: data.value,
        type: data.type.toUpperCase(),
      },
    });

    // Create initial snapshot
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: data.value,
      },
    });

    const { AggregationService } = await import('./aggregation.service.js');
    await AggregationService.createUserSnapshot(userId);

    return { portfolio, holding };
  }

  static async getAll(userId: string) {
    return prisma.portfolio.findMany({
      where: { userId, type: 'MANUAL' },
      include: { holdings: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateValue(userId: string, portfolioId: string, newValue: number) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId, type: 'MANUAL' },
      include: { holdings: true },
    });

    if (!portfolio || portfolio.holdings.length === 0) throw new Error('Manual portfolio not found');

    const holdingId = portfolio.holdings[0].id;
    const quantity = portfolio.holdings[0].quantity;

    await prisma.holding.update({
      where: { id: holdingId },
      data: {
        value: newValue,
        currentPrice: newValue / quantity,
      },
    });

    // Create new snapshot for history
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: newValue,
      },
    });

    const { AggregationService } = await import('./aggregation.service.js');
    await AggregationService.createUserSnapshot(userId);

    return portfolio;
  }

  static async delete(userId: string, portfolioId: string) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId, type: 'MANUAL' },
    });

    if (!portfolio) throw new Error('Manual portfolio not found');

    // Cascade delete is handled by database if configured, 
    // but here we manually delete relatives if needed or rely on Prisma.
    // In our schema we didn't specify onDelete: Cascade, so let's delete manually.
    await prisma.holding.deleteMany({ where: { portfolioId } });
    await prisma.portfolioSnapshot.deleteMany({ where: { portfolioId } });
    
    return prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  }
}
