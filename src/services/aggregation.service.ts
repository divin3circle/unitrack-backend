import prisma from '../config/database';

export class AggregationService {
  /**
   * Creates a point-in-time snapshot of the user's total portfolio value.
   * This is called after sync events or change events to ensure history is updated.
   */
  static async createUserSnapshot(userId: string) {
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

    return prisma.userPortfolioSnapshot.create({
      data: {
        userId,
        totalValue,
      },
    });
  }

  /**
   * Daily job logic to ensure every user has at least one snapshot per day.
   */
  static async runDailyAggregation() {
    const users = await prisma.user.findMany();
    for (const user of users) {
      await this.createUserSnapshot(user.id);
    }
  }
}
