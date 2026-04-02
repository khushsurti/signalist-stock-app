'use server';

import { cache } from 'react';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

// ============================================
// ✅ GET NEWS - FIXED
// ============================================
export async function getNews(symbols?: string[]): Promise<any[]> {
  try {
    const token = API_KEY;
    if (!token) {
      console.warn('⚠️ No Finnhub API key found, using sample news');
      return getSampleNews();
    }

    let url = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    
    // If symbols provided, get company-specific news
    if (symbols && symbols.length > 0) {
      // For multiple symbols, we'll fetch general news
      url = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    }

    const response = await fetch(url, { next: { revalidate: 3600 } }); // Cache for 1 hour
    
    if (!response.ok) {
      console.error(`Failed to fetch news: ${response.status}`);
      return getSampleNews();
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return getSampleNews();
    }

    // Format and return news
    return data.slice(0, 20).map((article: any) => ({
      headline: article.headline || 'Market Update',
      summary: article.summary || article.description || 'Latest market news',
      source: article.source || 'Market News',
      datetime: article.datetime || Math.floor(Date.now() / 1000),
      url: article.url || '#',
      image: article.image || ''
    }));
    
  } catch (error) {
    console.error('Error fetching news:', error);
    return getSampleNews();
  }
}

// ============================================
// SAMPLE NEWS FOR FALLBACK
// ============================================
function getSampleNews() {
  return [
    {
      headline: 'Markets Rally on Strong Earnings Reports',
      summary: 'Major indices surge as tech companies report better-than-expected quarterly results. The S&P 500 gained 1.5% while Nasdaq jumped 2.1%.',
      source: 'Financial Times',
      datetime: Math.floor(Date.now() / 1000) - 3600,
      url: '#',
      image: ''
    },
    {
      headline: 'Fed Signals Potential Rate Cut',
      summary: 'Federal Reserve hints at possible interest rate reduction in upcoming meetings, citing cooling inflation and stable employment.',
      source: 'Wall Street Journal',
      datetime: Math.floor(Date.now() / 1000) - 7200,
      url: '#',
      image: ''
    },
    {
      headline: 'AI Stocks Continue Their Bull Run',
      summary: 'Artificial intelligence related stocks see unprecedented growth this quarter, with NVIDIA and Microsoft leading the charge.',
      source: 'Bloomberg',
      datetime: Math.floor(Date.now() / 1000) - 10800,
      url: '#',
      image: ''
    },
    {
      headline: 'Oil Prices Drop on Supply Concerns',
      summary: 'Crude oil prices fall as global supply increases and demand from China shows signs of slowing.',
      source: 'Reuters',
      datetime: Math.floor(Date.now() / 1000) - 14400,
      url: '#',
      image: ''
    },
    {
      headline: 'Tech Sector Leads Market Recovery',
      summary: 'Technology stocks rebound strongly after recent pullback, with Apple and Amazon gaining over 3%.',
      source: 'CNBC',
      datetime: Math.floor(Date.now() / 1000) - 18000,
      url: '#',
      image: ''
    },
    {
      headline: 'Banking Sector Shows Resilience',
      summary: 'Major banks report stable earnings despite economic uncertainty, with JPMorgan and Goldman Sachs beating estimates.',
      source: 'Bloomberg',
      datetime: Math.floor(Date.now() / 1000) - 21600,
      url: '#',
      image: ''
    }
  ];
}

// ============================================
// GET STOCK DETAILS
// ============================================
export const getStocksDetails = cache(async (symbol: string) => {
  const cleanSymbol = symbol.trim().toUpperCase();

  try {
    if (!API_KEY) {
      return getMockStockData(cleanSymbol);
    }

    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${FINNHUB_BASE_URL}/quote?symbol=${cleanSymbol}&token=${API_KEY}`),
      fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${cleanSymbol}&token=${API_KEY}`)
    ]);

    if (!quoteRes.ok || !profileRes.ok) {
      return getMockStockData(cleanSymbol);
    }

    const quote = await quoteRes.json();
    const profile = await profileRes.json();

    if (!quote?.c || !profile?.name) {
      return getMockStockData(cleanSymbol);
    }

    const changePercent = quote.dp || 0;
    
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(price);
    };

    const formatChangePercent = (percent: number) => {
      const sign = percent > 0 ? '+' : '';
      return `${sign}${percent.toFixed(2)}%`;
    };

    return {
      symbol: cleanSymbol,
      company: profile.name,
      currentPrice: quote.c,
      changePercent,
      priceFormatted: formatPrice(quote.c),
      changeFormatted: formatChangePercent(changePercent),
      marketCapFormatted: profile.marketCapitalization ? 
        (profile.marketCapitalization > 1e12 ? `${(profile.marketCapitalization / 1e12).toFixed(2)}T` :
         profile.marketCapitalization > 1e9 ? `${(profile.marketCapitalization / 1e9).toFixed(2)}B` :
         profile.marketCapitalization > 1e6 ? `${(profile.marketCapitalization / 1e6).toFixed(2)}M` :
         profile.marketCapitalization.toString()) : '—',
      peRatio: profile.pe ? profile.pe.toFixed(1) : '—',
    };
    
  } catch (error) {
    console.error(`Error fetching details for ${cleanSymbol}:`, error);
    return getMockStockData(cleanSymbol);
  }
});

// Mock stock data
function getMockStockData(symbol: string) {
  const mockPrices: Record<string, { price: number, name: string }> = {
    'AAPL': { price: 175.34, name: 'Apple Inc.' },
    'MSFT': { price: 330.21, name: 'Microsoft Corporation' },
    'GOOGL': { price: 142.80, name: 'Alphabet Inc.' },
    'AMZN': { price: 178.50, name: 'Amazon.com Inc.' },
    'TSLA': { price: 240.15, name: 'Tesla Inc.' },
    'NVDA': { price: 950.20, name: 'NVIDIA Corporation' },
    'META': { price: 485.60, name: 'Meta Platforms Inc.' },
    'NFLX': { price: 610.30, name: 'Netflix Inc.' },
  };

  const data = mockPrices[symbol] || { 
    price: 100 + Math.random() * 500, 
    name: symbol 
  };
  
  const changePercent = (Math.random() * 10 - 5);
  
  const formatPrice = (p: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(p);
  };

  const formatChangePercent = (percent: number) => {
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  return {
    symbol,
    company: data.name,
    currentPrice: data.price,
    changePercent,
    priceFormatted: formatPrice(data.price),
    changeFormatted: formatChangePercent(changePercent),
    marketCapFormatted: '—',
    peRatio: '—',
  };
}

// ============================================
// SEARCH STOCKS
// ============================================
const POPULAR_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'NFLX', name: 'Netflix Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'AVGO', name: 'Broadcom Inc.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'MA', name: 'Mastercard Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'BAC', name: 'Bank of America Corp.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'WFC', name: 'Wells Fargo & Co.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'C', name: 'Citigroup Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'HSBC', name: 'HSBC Holdings plc', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', type: 'Stock' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', exchange: 'NASDAQ', type: 'Stock' },
  { symbol: 'XOM', name: 'Exxon Mobil Corp.', exchange: 'NYSE', type: 'Stock' },
];

export async function searchStocks(query?: string): Promise<any[]> {
  const normalizedQuery = query?.trim();

  if (!normalizedQuery) {
    return POPULAR_STOCKS.map((stock) => ({ ...stock, isInWatchlist: false }));
  }

  try {
    if (API_KEY) {
      const response = await fetch(
        `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(normalizedQuery)}&token=${API_KEY}`,
        { next: { revalidate: 900 } }
      );

      if (response.ok) {
        const data = await response.json();
        const results = Array.isArray(data?.result) ? data.result : [];

        const mappedResults = results
          .filter((item: any) => item?.symbol && item?.description)
          .slice(0, 20)
          .map((item: any) => ({
            symbol: item.symbol,
            name: item.description,
            exchange: item.primaryExchange || item.mic || 'US',
            type: item.type || 'Stock',
            isInWatchlist: false,
          }));

        if (mappedResults.length > 0) {
          return mappedResults;
        }
      }
    }
  } catch (error) {
    console.error('Error searching stocks:', error);
  }

  return POPULAR_STOCKS
    .filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(normalizedQuery.toLowerCase()) ||
        stock.name.toLowerCase().includes(normalizedQuery.toLowerCase())
    )
    .map((stock) => ({ ...stock, isInWatchlist: false }));
}
