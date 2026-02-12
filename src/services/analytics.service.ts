import { PortfolioService } from "./portfolio.service";

export class AnalyticsService {
  static async getHealthScore(userId: string) {
    const allocation = await PortfolioService.getAllocation(userId);
    const totalValue = allocation.reduce((sum, item) => sum + item.value, 0);

    if (totalValue === 0) {
      return {
        score: 0,
        status: "Empty",
        summary: "Your portfolio is empty. Add some assets to get started!",
      };
    }

    const stockAlloc =
      allocation.find((a) => a.category === "STOCK")?.percentage || 0;
    const cryptoAlloc =
      allocation.find((a) => a.category === "CRYPTO")?.percentage || 0;

    let score = 75; // Baseline
    let status = "Healthy";
    let summary = "Your portfolio is well-balanced.";

    if (cryptoAlloc > 0.4) {
      score -= 20;
      status = "High Risk";
      summary =
        "High crypto exposure detected. Consider stabilizing with less volatile assets.";
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
    return (
      `Analysis for your $${summary.totalValue.toLocaleString()} portfolio: ` +
      `Your top allocation is ${allocation[0]?.category || "undetermined"}. ` +
      `Regarding "${message}", you should consider your current risk status which is ${(await this.getHealthScore(userId)).status}.`
    );
  }

  /**
   * PREMIUM: Geographic Exposure Analysis
   * Mock implementation for demo purposes
   */
  static async getGeographicExposure(userId: string) {
    const holdings = await PortfolioService.getHoldings(userId);

    const exposure: Record<string, number> = {
      "North America": 0,
      Europe: 0,
      Asia: 0,
      "Global (Crypto)": 0,
      Other: 0,
    };

    let totalValue = 0;

    holdings.forEach((h) => {
      totalValue += h.value;
      if (h.portfolioType === "WALLET" || h.type === "CRYPTO") {
        exposure["Global (Crypto)"] += h.value;
      } else if (h.type === "REAL_ESTATE" || h.type === "COMMODITY") {
        exposure["Other"] += h.value;
      } else {
        // Simple mock mapping for stocks/assets
        const firstChar = h.ticker?.[0] || "";
        if ("ABCDE".includes(firstChar)) exposure["Europe"] += h.value;
        else if ("FGHIJ".includes(firstChar)) exposure["Asia"] += h.value;
        else exposure["North America"] += h.value;
      }
    });

    return Object.entries(exposure)
      .map(([region, value]) => ({
        region,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      }))
      .filter((e) => e.value > 0);
  }

  /**
   * PREMIUM: Manual Asset Amortization
   * Simple 12-month projection demo
   */
  static async getAmortization(userId: string, portfolioId: string) {
    const portfolios = await PortfolioService.getAllPortfolios(userId);
    const portfolio = portfolios.find(
      (p) => p.id === portfolioId && p.type === "MANUAL",
    );

    if (!portfolio) throw new Error("Manual portfolio not found");

    const currentValue = portfolio.totalValue;
    const isAppreciating =
      portfolio.name.toLowerCase().includes("real estate") ||
      portfolio.name.toLowerCase().includes("gold");
    const rate = isAppreciating ? 0.005 : -0.008; // 0.5% growth or 0.8% decay

    const projection = [];
    for (let i = 0; i <= 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() + i);
      projection.push({
        month: date.toLocaleString("default", {
          month: "short",
          year: "2-digit",
        }),
        value: currentValue * Math.pow(1 + rate, i),
      });
    }

    return {
      assetName: portfolio.name,
      currentValue,
      projectionType: isAppreciating ? "Appreciation" : "Depreciation",
      monthlyRate: rate * 100,
      projection,
    };
  }
}
