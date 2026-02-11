import prisma from '../config/database';
import { AggregationService } from './aggregation.service';

export interface ManualAssetData {
  name: string;
  type: string; // The type of the portfolio/asset (e.g., Real Estate, Crypto, etc.)
  value: number; // Current value
  quantity?: number;
  ticker?: string;
  currency?: string;
  notes?: string;
  
  // Transaction metadata
  transactionType?: string; // e.g., "BUY", "SELL", "TRANSFER", "INITIAL"
  description?: string; // User description of the transaction
  transactionDate?: Date | string; // When the transaction occurred
  purchasePrice?: number; // Original purchase price
}

export interface ManualAssetUpdateData {
  value: number;
  date?: Date | string; // Optional: specify the date for the snapshot
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

    const quantity = data.quantity ?? 1;
    const purchasePrice = data.purchasePrice ?? data.value / quantity;

    const holding = await prisma.holding.create({
      data: {
        portfolioId: portfolio.id,
        name: data.name,
        ticker: data.ticker,
        quantity,
        currentPrice: data.value / quantity,
        value: data.value,
        type: data.type.toUpperCase(),
        costBasis: purchasePrice * quantity,
        purchasePrice,
        transactionType: data.transactionType || 'INITIAL',
        description: data.description || data.notes,
        transactionDate: data.transactionDate ? new Date(data.transactionDate) : new Date(),
      },
    });

    // Create initial snapshot
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: data.value,
        date: data.transactionDate ? new Date(data.transactionDate) : new Date(),
      },
    });

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

  static async updateValue(userId: string, portfolioId: string, updateData: ManualAssetUpdateData) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId, type: 'MANUAL' },
      include: { holdings: true },
    });

    if (!portfolio || portfolio.holdings.length === 0) throw new Error('Manual portfolio not found');

    const holdingId = portfolio.holdings[0].id;
    const quantity = portfolio.holdings[0].quantity;
    const newValue = updateData.value;

    await prisma.holding.update({
      where: { id: holdingId },
      data: {
        value: newValue,
        currentPrice: newValue / quantity,
      },
    });

    // Create new snapshot for history with optional custom date
    const snapshotDate = updateData.date ? new Date(updateData.date) : new Date();
    
    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId: portfolio.id,
        totalValue: newValue,
        date: snapshotDate,
      },
    });

    await AggregationService.createUserSnapshot(userId);

    return portfolio;
  }

  static async delete(userId: string, portfolioId: string) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId, type: 'MANUAL' },
    });

    if (!portfolio) throw new Error('Manual portfolio not found');

    // Delete related data
    await prisma.holding.deleteMany({ where: { portfolioId } });
    await prisma.portfolioSnapshot.deleteMany({ where: { portfolioId } });
    
    return prisma.portfolio.delete({
      where: { id: portfolioId },
    });
  }
}
