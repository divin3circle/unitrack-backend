import prisma from '../config/database';

export class PortfolioService {
  static async getAllPortfolios(userId: string) {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true,
        snapshots: {
          orderBy: { date: 'desc' },
          take: 1, // Get latest snapshot
        },
      },
    });

    return portfolios.map((p: any) => {
      const totalValue = p.holdings.reduce((sum: number, h: any) => sum + h.value, 0);
      const latestSnapshot = p.snapshots[0];

      return {
        id: p.id,
        name: p.name,
        type: p.type,
        status: p.status,
        totalValue,
        lastSynced: p.lastSynced,
        createdAt: p.createdAt,
        // Type-specific metadata
        ...(p.type === 'PLAID' && {
          institutionId: p.institutionId,
          institutionName: p.institutionName,
        }),
        ...(p.type === 'WALLET' && {
          walletAddress: p.walletAddress,
          network: p.network,
        }),
        // Snapshot data
        latestSnapshot: latestSnapshot ? {
          date: latestSnapshot.date,
          value: latestSnapshot.totalValue,
        } : null,
      };
    });
  }

  static async getPortfolioById(userId: string, portfolioId: string) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { id: portfolioId, userId },
      include: {
        holdings: true,
        snapshots: {
          orderBy: { date: 'desc' },
          take: 30, // Last 30 snapshots for charting
        },
      },
    });

    if (!portfolio) return null;

    const totalValue = (portfolio.holdings as any[]).reduce((sum, h: any) => sum + h.value, 0);

    return {
      id: portfolio.id,
      name: portfolio.name,
      type: portfolio.type,
      status: portfolio.status,
      totalValue,
      lastSynced: portfolio.lastSynced,
      createdAt: portfolio.createdAt,
      updatedAt: portfolio.updatedAt,
      // Type-specific metadata
      ...(portfolio.type === 'PLAID' && {
        institutionId: portfolio.institutionId,
        institutionName: portfolio.institutionName,
      }),
      ...(portfolio.type === 'WALLET' && {
        walletAddress: portfolio.walletAddress,
        network: portfolio.network,
      }),
      // Holdings
      holdings: (portfolio.holdings as any[]).map((h: any) => ({
        id: h.id,
        ticker: h.ticker,
        name: h.name,
        type: h.type,
        quantity: h.quantity,
        currentPrice: h.currentPrice,
        value: h.value,
        costBasis: h.costBasis,
      })),
      // Historical snapshots
      snapshots: (portfolio.snapshots as any[]).map((s: any) => ({
        date: s.date.toISOString().split('T')[0],
        value: s.totalValue,
      })),
    };
  }

  static async getSummary(userId: string) {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { holdings: true },
    });

    let totalValue = 0;
    portfolios.forEach((p: any) => {
      p.holdings.forEach((h: any) => {
        totalValue += h.value;
      });
    });

    // TODO: Calculate 24h change by comparing with latest snapshots from 24h ago
    const change24h = 0;
    const changePercent24h = 0;

    return {
      totalValue,
      currency: "USD",
      change24h,
      changePercent24h,
      lastUpdated: new Date().toISOString(),
    };
  }

  static async getAllocation(userId: string) {
    const holdings = await prisma.holding.findMany({
      where: { portfolio: { userId } },
    });

    const categories: Record<string, number> = {};
    let totalValue = 0;

    holdings.forEach((h: any) => {
      const type = h.type || 'OTHER';
      categories[type] = (categories[type] || 0) + h.value;
      totalValue += h.value;
    });

    return Object.entries(categories).map(([category, value]) => ({
      category,
      value,
      percentage: totalValue > 0 ? value / totalValue : 0,
    }));
  }

  static async getHoldings(userId: string) {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { holdings: true },
    });

    const holdings = portfolios.flatMap((p: any) => 
      p.holdings.map((h: any) => ({
        id: h.id,
        portfolioId: p.id,
        portfolioName: p.name,
        portfolioType: p.type,
        ticker: h.ticker,
        name: h.name,
        type: h.type,
        quantity: h.quantity,
        price: h.currentPrice,
        value: h.value,
        source: p.institutionName || (p.type === 'WALLET' ? p.walletAddress : 'Manual'),
      }))
    );

    return holdings;
  }

  static async getHistory(userId: string, range: string = '1M') {
    // Now pulling from the dedicated aggregated table
    const snapshots = await prisma.userPortfolioSnapshot.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });

    return snapshots.map((s: any) => ({
      date: s.date.toISOString().split('T')[0],
      value: s.totalValue,
    }));
  }
}
