import { PortfolioService } from './portfolio.service';

export class AnalyticsService {
  static async getHealthScore(userId: string) {
    const allocation = await PortfolioService.getAllocation(userId);
    const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
      return {
        score: 0,
        status: 'Empty',
        summary: 'Your portfolio is empty. Add some assets to get started!',
      };
    }

    const stockAlloc = allocation.find((a) => a.category === 'STOCK')?.percentage || 0;
    const cryptoAlloc = allocation.find((a) => a.category === 'CRYPTO')?.percentage || 0;

    let score = 75; // Baseline
    let status = 'Healthy';
    let summary = 'Your portfolio is well-balanced.';

    if (cryptoAlloc > 0.4) {
      score -= 20;
      status = 'High Risk';
      summary = 'High crypto exposure detected. Consider stabilizing with less volatile assets.';
    }

    return {
      score,
      status,
      summary,
    };
  }

  static async chat(userId: string, message: string) {
    const summary = await PortfolioService.getSummary(userId);
    const allocation = await PortfolioService.getAllocation(userId);

    // Mock Gemini response seeded with real portfolio context
    return `Analysis for your $${summary.totalValue.toLocaleString()} portfolio: ` +
           `Your top allocation is ${allocation[0]?.category || 'undetermined'}. ` +
           `Regarding "${message}", you should consider your current risk status which is ${ (await this.getHealthScore(userId)).status }.`;
  }
}
