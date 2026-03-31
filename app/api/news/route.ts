import { NextResponse } from 'next/server';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

type RawNews = {
  id?: number;
  headline?: string;
  summary?: string;
  source?: string;
  datetime?: number;
  url?: string;
  category?: string;
  image?: string;
};

const STOCK_KEYWORDS = [
  'stock',
  'stocks',
  'share',
  'shares',
  'equity',
  'equities',
  'market',
  'markets',
  'wall street',
  'dow',
  'nasdaq',
  's&p',
  'earnings',
  'revenue',
  'guidance',
  'ipo',
  'analyst',
  'bullish',
  'bearish',
  'dividend',
  'buyback',
  'valuation',
  'jpmorgan',
  'goldman',
  'morgan stanley',
];

const NON_STOCK_KEYWORDS = [
  'crypto',
  'bitcoin',
  'ethereum',
  'forex',
  'eurusd',
  'usd/jpy',
  'commodity only',
];

function isStockRelated(article: RawNews): boolean {
  const text = `${article.headline || ''} ${article.summary || ''} ${article.category || ''}`.toLowerCase();
  const hasStockSignal = STOCK_KEYWORDS.some((keyword) => text.includes(keyword));
  const hasNonStockSignal = NON_STOCK_KEYWORDS.some((keyword) => text.includes(keyword));
  return hasStockSignal && !hasNonStockSignal;
}

function inferSentiment(text: string): 'positive' | 'negative' | 'neutral' {
  const value = text.toLowerCase();
  const positiveWords = ['surge', 'gain', 'up', 'beat', 'bullish', 'rally', 'strong'];
  const negativeWords = ['fall', 'down', 'drop', 'miss', 'bearish', 'weak', 'decline'];

  const hasPositive = positiveWords.some((word) => value.includes(word));
  const hasNegative = negativeWords.some((word) => value.includes(word));

  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
}

function mapArticle(article: RawNews, index: number) {
  const headline = article.headline || 'Market Update';
  const summary = article.summary || 'Latest market update';
  const category = article.category || 'General';
  const datetimeIso = article.datetime ? new Date(article.datetime * 1000).toISOString() : new Date().toISOString();

  return {
    id: String(article.id || `${Date.now()}-${index}`),
    headline,
    summary,
    content: summary,
    source: article.source || 'Market News',
    datetime: datetimeIso,
    url: article.url || '#',
    category,
    sentiment: inferSentiment(`${headline} ${summary}`),
    stockImpact: 'Market',
    imageUrl: article.image || '',
    author: article.source || 'Market Desk',
    readTime: 2,
    relatedStocks: [],
  };
}

function getFallbackNews() {
  return [
    {
      id: 'fallback-1',
      headline: 'Live market feed unavailable',
      summary: 'Please add FINNHUB_API_KEY in .env to enable live daily news feed.',
      content: 'Please add FINNHUB_API_KEY in .env to enable live daily news feed.',
      source: 'System',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'System',
      sentiment: 'neutral' as const,
      stockImpact: 'Market',
      imageUrl: '',
      author: 'Signalist',
      readTime: 1,
      relatedStocks: [],
    },
  ];
}

export async function GET() {
  try {
    if (!API_KEY) {
      return NextResponse.json(getFallbackNews(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      });
    }

    const response = await fetch(`${FINNHUB_BASE_URL}/news?category=general&token=${API_KEY}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Finnhub news request failed with status ${response.status}`);
    }

    const rawData = (await response.json()) as RawNews[];
    const sourceList = Array.isArray(rawData) ? rawData : [];
    const filteredStockNews = sourceList.filter(isStockRelated);
    const list = (filteredStockNews.length > 0 ? filteredStockNews : sourceList).slice(0, 30);
    const mapped = list.map((article, index) => mapArticle(article, index));

    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching live news:', error);

    return NextResponse.json(getFallbackNews(), {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  }
}
