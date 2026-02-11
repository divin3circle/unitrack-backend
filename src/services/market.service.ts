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
  
  // Branding & links
  logoUrl?: string;
  iconUrl?: string;
  homepageUrl?: string;
  
  // Metadata
  market?: string;
  locale?: string;
  primaryExchange?: string;
  currencyName?: string;
  listDate?: string;
  address?: {
    address1?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
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
      let quoteResponse;
      try {
        quoteResponse = await axios.get(
          `${MASSIVE_BASE_URL}/v2/last/nbbo/${ticker.toUpperCase()}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
            validateStatus: () => true, // Don't throw on error status codes
          }
        );
      } catch (e) {
        // Fallback below
      }

      let quote = quoteResponse?.data?.results;
      
      // Fallback to previous close if NBBO is unauthorized or failed
      if (!quoteResponse || quoteResponse.data?.status === 'NOT_AUTHORIZED' || !quote) {
        const prevResponse = await axios.get(
          `${MASSIVE_BASE_URL}/v2/aggs/ticker/${ticker.toUpperCase()}/prev`,
          { params: { apiKey: MASSIVE_API_KEY } }
        );
        quote = prevResponse.data?.results?.[0];
      }

      // Get ticker details
      const detailsResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v3/reference/tickers/${ticker.toUpperCase()}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      const details = detailsResponse.data?.results;

      if (!details) return null;

      return {
        ticker: ticker.toUpperCase(),
        name: details.name,
        price: quote?.P || quote?.c || 0, // P for NBBO, c for aggregate close
        marketCap: details.market_cap,
        description: details.description,
        type: 'stock',
        
        // Performance (calculated if we have both current and prev close)
        // Note: For limited plans, quote is often the prev day close itself
        // But if we have actual NBBO or minute data, this works.
        change: quote?.todaysChange,
        changePercent: quote?.todaysChangePerc,

        // Branding
        logoUrl: details.branding?.logo_url,
        iconUrl: details.branding?.icon_url,
        homepageUrl: details.homepage_url,

        // Metadata
        market: details.market,
        locale: details.locale,
        primaryExchange: details.primary_exchange,
        currencyName: details.currency_name,
        listDate: details.list_date,
        address: details.address,
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

      let tradeResponse;
      try {
        tradeResponse = await axios.get(
          `${MASSIVE_BASE_URL}/v1/last/crypto/${massiveTicker}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
            validateStatus: () => true,
          }
        );
      } catch (e) {
        // Fallback below
      }

      let lastTrade = tradeResponse?.data?.last;
      
      // Fallback to previous close if last trade is unauthorized or not found
      if (!tradeResponse || tradeResponse.data?.status === 'NOT_AUTHORIZED' || !lastTrade) {
        const prevResponse = await axios.get(
          `${MASSIVE_BASE_URL}/v2/aggs/ticker/X:${ticker.toUpperCase()}USD/prev`,
          { params: { apiKey: MASSIVE_API_KEY } }
        );
        lastTrade = prevResponse.data?.results?.[0];
      }

      // Get ticker details
      const detailsResponse = await axios.get(
        `${MASSIVE_BASE_URL}/v3/reference/tickers/${massiveTicker}`,
        {
          params: { apiKey: MASSIVE_API_KEY },
        }
      );

      const details = detailsResponse.data?.results;

      if (!details) return null;

      return {
        ticker: ticker.toUpperCase(),
        name: details.name || `${ticker.toUpperCase()} Cryptocurrency`,
        price: lastTrade?.price || lastTrade?.c || 0,
        description: details.description,
        type: 'crypto',
        
        // Branding
        logoUrl: details.branding?.logo_url,
        iconUrl: details.branding?.icon_url,
        homepageUrl: details.homepage_url,

        // Metadata
        market: details.market,
        locale: details.locale,
        currencyName: details.currency_name,
        listDate: details.list_date,
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
          `${MASSIVE_BASE_URL}/v2/last/nbbo/${ticker.toUpperCase()}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
            validateStatus: () => true,
          }
        );
        
        if (response.data?.status === 'NOT_AUTHORIZED' || !response.data?.results?.P) {
          const prevResponse = await axios.get(
            `${MASSIVE_BASE_URL}/v2/aggs/ticker/${ticker.toUpperCase()}/prev`,
            { params: { apiKey: MASSIVE_API_KEY } }
          );
          return prevResponse.data?.results?.[0]?.c || null;
        }
        
        return response.data?.results?.P || null;
      } else {
        const massiveTicker = `X:${ticker.toUpperCase()}USD`;
        const response = await axios.get(
          `${MASSIVE_BASE_URL}/v1/last/crypto/${massiveTicker}`,
          {
            params: { apiKey: MASSIVE_API_KEY },
            validateStatus: () => true,
          }
        );

        if (response.data?.status === 'NOT_AUTHORIZED' || !response.data?.last?.price) {
          const prevResponse = await axios.get(
            `${MASSIVE_BASE_URL}/v2/aggs/ticker/${massiveTicker}/prev`,
            { params: { apiKey: MASSIVE_API_KEY } }
          );
          return prevResponse.data?.results?.[0]?.c || null;
        }

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
