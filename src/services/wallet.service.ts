import prisma from '../config/database';
import axios from 'axios';

const ETH_RPC = 'https://cloudflare-eth.com'; // Public RPC
const USDC_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

export class WalletService {
  static async connectWallet(userId: string, address: string, label: string) {
    // Create the portfolio entry
    const portfolio = await prisma.portfolio.create({
      data: {
        userId,
        name: label,
        type: 'WALLET',
        walletAddress: address,
        network: 'ethereum',
      },
    });

    // Initial sync
    await this.syncWallet(portfolio.id);
    return portfolio;
  }

  static async syncWallet(portfolioId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    });

    if (!portfolio || !portfolio.walletAddress) return;

    const address = portfolio.walletAddress;

    // 1. Fetch ETH Balance
    const ethBalance = await this.getEthBalance(address);
    // 2. Fetch USDC Balance
    const usdcBalance = await this.getUsdcBalance(address);

    // Get current ETH price (mock or simple API)
    const ethPrice = await this.getAssetPrice('ethereum');
    const usdcPrice = 1.0; // Fixed for now

    // Clear existing holdings
    await prisma.holding.deleteMany({ where: { portfolioId } });

    // Create ETH holding
    if (ethBalance > 0) {
      await prisma.holding.create({
        data: {
          portfolioId,
          ticker: 'ETH',
          name: 'Ethereum',
          quantity: ethBalance,
          currentPrice: ethPrice,
          value: ethBalance * ethPrice,
          type: 'CRYPTO',
        },
      });
    }

    // Create USDC holding
    if (usdcBalance > 0) {
      await prisma.holding.create({
        data: {
          portfolioId,
          ticker: 'USDC',
          name: 'USD Coin',
          quantity: usdcBalance,
          currentPrice: usdcPrice,
          value: usdcBalance * usdcPrice,
          type: 'CRYPTO',
        },
      });
    }

    // Update total value and snapshot
    const totalValue = (ethBalance * ethPrice) + (usdcBalance * usdcPrice);
    
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { lastSynced: new Date() },
    });

    await prisma.portfolioSnapshot.create({
      data: {
        portfolioId,
        totalValue,
      },
    });

    // Trigger aggregated user snapshot
    const { AggregationService } = await import('./aggregation.service.js');
    await AggregationService.createUserSnapshot(portfolio.userId);
  }

  private static async getEthBalance(address: string): Promise<number> {
    try {
      const response = await axios.post(ETH_RPC, {
        jsonrpc: '2.0',
        method: 'eth_getBalance',
        params: [address, 'latest'],
        id: 1,
      });
      const hexBalance = response.data.result;
      const wei = parseInt(hexBalance, 16);
      return wei / 1e18;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return 0;
    }
  }

  private static async getUsdcBalance(address: string): Promise<number> {
    try {
      // ERC20 balanceOf(address) selector: 0x70a08231
      const data = '0x70a08231' + address.replace('0x', '').padStart(64, '0');
      const response = await axios.post(ETH_RPC, {
        jsonrpc: '2.0',
        method: 'eth_call',
        params: [{ to: USDC_CONTRACT, data }, 'latest'],
        id: 1,
      });
      const hexBalance = response.data.result;
      const raw = parseInt(hexBalance, 16);
      return raw / 1e6; // USDC has 6 decimals
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      return 0;
    }
  }

  private static async getAssetPrice(id: string): Promise<number> {
    try {
      // Simple mock or public API like CoinGecko
      const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
      return response.data[id].usd;
    } catch {
      return 2500; // Fallback
    }
  }
}
