import axios from 'axios';

const MASSIVE_API_KEY = process.env.MASSIVE_FINANCE_API || '';
const MASSIVE_BASE_URL = 'https://api.massive.com';

export interface MarketSearchResult {
  ticker: string;
  name: string;
  type: string;
  logoUrl?: string;
}

export interface AssetDetails {
  ticker: string;
  name: string;
  price: number;
  change?: number;
  changePercent?: number;
  marketCap?: number;
  description?: string;
  type: 'stock' | 'crypto';
}

export class MarketService {
  /**
   * Search for stocks by ticker
   */
  static async search(query: string): Promise<MarketSearchResult[]> {
    try {
      const results: MarketSearchResult[] = [];

      // Try to get ticker details for stocks
      try {
        const response = await axios.get(
          `${MASSIVE_BASE_URL}/v3/reference/tickers/${query.toUpperCase()}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
          }
        );

        if (response.data?.results) {
          const data = response.data.results;
          results.push({
            ticker: data.ticker,
            name: data.name,
            type: 'Stock',
            logoUrl: data.branding?.logo_url,
          });
        }
      } catch (e) {
        // Ticker not found - that's okay
      }

      // Try crypto (X:BTCUSD format)
      try {
        const cryptoTicker = `X:${query.toUpperCase()}USD`;
        const response = await axios.get(
          `${MASSIVE_BASE_URL}/v3/reference/tickers/${cryptoTicker}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
          }
        );

        if (response.data?.results) {
          results.push({
            ticker: query.toUpperCase(),
            name: response.data.results.name || `${query.toUpperCase()} Crypto`,
            type: 'Crypto',
          });
        }
      } catch (e) {
        // Crypto not found
      }

      return results;
    } catch (error) {
      console.error('Market search error:', error);
      return [];
    }
  }

  /**
   * Get detailed information and current price for a stock ticker
   */
  static async getStockDetails(ticker: string): Promise<AssetDetails | null> {
    try {
      // Get latest quote
      const quoteResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v2/last/nbbo/${ticker}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      // Get ticker details
      const detailsResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v3/reference/tickers/${ticker}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      const quote = quoteResponse.data?.results;
      const details = detailsResponse.data?.results;

      if (!quote || !details) return null;

      return {
        ticker: ticker.toUpperCase(),
        name: details.name,
        price: quote.P || 0, // Ask price
        marketCap: details.market_cap,
        description: details.description,
        type: 'stock',
      };
    } catch (error) {
      console.error(`Error fetching stock details for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get detailed information and current price for a crypto ticker
   */
  static async getCryptoDetails(ticker: string): Promise<AssetDetails | null> {
    try {
      const massiveTicker = `X:${ticker.toUpperCase()}USD`;

      // Get latest trade
      const tradeResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v1/last/crypto/${massiveTicker}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      // Get ticker details
      const detailsResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v3/reference/tickers/${massiveTicker}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      const trade = tradeResponse.data?.last;
      const details = detailsResponse.data?.results;

      if (!trade || !details) return null;

      return {
        ticker: ticker.toUpperCase(),
        name: details.name || `${ticker.toUpperCase()} Cryptocurrency`,
        price: trade.price || 0,
        description: details.description,
        type: 'crypto',
      };
    } catch (error) {
      console.error(`Error fetching crypto details for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get asset details - automatically detects if it's stock or crypto
   */
  static async getAssetDetails(ticker: string): Promise<AssetDetails | null> {
    // Try stock first
    let details = await this.getStockDetails(ticker);
    if (details) return details;

    // Fall back to crypto
    details = await this.getCryptoDetails(ticker);
    return details;
  }

  /**
   * Get current price for a ticker (stock or crypto)
   */
  static async getCurrentPrice(ticker: string, type: 'stock' | 'crypto' = 'stock'): Promise<number | null> {
    try {
      if (type === 'stock') {
        const response = await axios.get(
          `${MASSIVE_BASE_URL}/v2/last/nbbo/${ticker}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
          }
        );
        return response.data?.results?.P || null;
      } else {
        const massiveTicker = `X:${ticker.toUpperCase()}USD`;
        const response = await axios.get(
          `${MASSIVE_BASE_URL}/v1/last/crypto/${massiveTicker}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
          }
        );
        return response.data?.last?.price || null;
      }
    } catch (error) {
      console.error(`Error fetching price for ${ticker}:`, error);
      return null;
    }
  }

  /**
   * Get historical aggregates (bars) for charting
   */
  static async getAggregates(
    ticker: string,
    from: string,
    to: string,
    timespan: 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year' = 'day'
  ) {
    try {
      const response = await axios.get(
        `${MASSIVE_BASE_URL}/v2/aggs/ticker/${ticker}/range/1/${timespan}/${from}/${to}`,
        {
          params: {
            apiKey: MASSIVE_API_KEY,
            adjusted: 'true',
            sort: 'asc',
            limit: 5000,
          },
        }
      );

      return response.data?.results || [];
    } catch (error) {
      console.error(`Error fetching aggregates for ${ticker}:`, error);
      return [];
    }
  }
}
