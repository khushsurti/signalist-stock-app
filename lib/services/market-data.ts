const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

interface MarketSnapshot {
  symbol: string;
  companyName: string;
  currentPrice: number;
}

const fallbackStocks: Record<string, { price: number; companyName: string }> = {
  AAPL: { price: 175.34, companyName: 'Apple Inc.' },
  AMZN: { price: 178.5, companyName: 'Amazon.com Inc.' },
  GOOGL: { price: 142.8, companyName: 'Alphabet Inc.' },
  JPM: { price: 187.24, companyName: 'JPMorgan Chase & Co.' },
  META: { price: 485.6, companyName: 'Meta Platforms Inc.' },
  MSFT: { price: 330.21, companyName: 'Microsoft Corporation' },
  NFLX: { price: 610.3, companyName: 'Netflix Inc.' },
  NVDA: { price: 950.2, companyName: 'NVIDIA Corporation' },
  TSLA: { price: 240.15, companyName: 'Tesla Inc.' },
};

function getFallbackSnapshot(symbol: string): MarketSnapshot {
  const normalizedSymbol = symbol.trim().toUpperCase();
  const fallback = fallbackStocks[normalizedSymbol];

  return {
    symbol: normalizedSymbol,
    companyName: fallback?.companyName || normalizedSymbol,
    currentPrice: fallback?.price || 100,
  };
}

export async function fetchLiveStockSnapshot(symbol: string): Promise<MarketSnapshot> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!API_KEY) {
    return getFallbackSnapshot(normalizedSymbol);
  }

  try {
    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(`${FINNHUB_BASE_URL}/quote?symbol=${normalizedSymbol}&token=${API_KEY}`, {
        cache: 'no-store',
      }),
      fetch(`${FINNHUB_BASE_URL}/stock/profile2?symbol=${normalizedSymbol}&token=${API_KEY}`, {
        cache: 'no-store',
      }),
    ]);

    if (!quoteResponse.ok || !profileResponse.ok) {
      return getFallbackSnapshot(normalizedSymbol);
    }

    const [quoteData, profileData] = await Promise.all([
      quoteResponse.json(),
      profileResponse.json(),
    ]);

    const currentPrice = Number(quoteData?.c);
    const companyName = profileData?.name;

    if (!Number.isFinite(currentPrice) || currentPrice <= 0) {
      return getFallbackSnapshot(normalizedSymbol);
    }

    return {
      symbol: normalizedSymbol,
      companyName: companyName || normalizedSymbol,
      currentPrice,
    };
  } catch (error) {
    console.error(`Error fetching live market data for ${normalizedSymbol}:`, error);
    return getFallbackSnapshot(normalizedSymbol);
  }
}
