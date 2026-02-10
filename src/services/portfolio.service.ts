import prisma from '../config/database';

export class PortfolioService {
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
