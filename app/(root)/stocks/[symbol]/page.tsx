import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistButton from '@/components/WatchlistButton';
import BuySellButtons from '@/components/ui/BuySellButtons';
import { WatchlistItem } from '@/database/models/watchlist.model';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';
import { getUserWatchlist } from '@/lib/actions/watchlist.actions';
import { getWallet } from '@/lib/actions/wallet.actions';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import PriceAlert from '@/components/ui/PriceAlert';
import { connectToDatabase } from '@/database/mongoose';
import ExpertSuggestion from '@/database/models/expert.model';
import ExpertSuggestionCard from '@/components/ui/ExpertSuggestionCard';
import {
  SYMBOL_INFO_WIDGET_CONFIG,
  CANDLE_CHART_WIDGET_CONFIG,
  BASELINE_WIDGET_CONFIG,
  TECHNICAL_ANALYSIS_WIDGET_CONFIG,
  COMPANY_PROFILE_WIDGET_CONFIG,
  COMPANY_FINANCIALS_WIDGET_CONFIG,
  MARKET_OVERVIEW_WIDGET_CONFIG,
  HEATMAP_WIDGET_CONFIG,
  TOP_STORIES_WIDGET_CONFIG,
  MARKET_DATA_WIDGET_CONFIG,
} from '@/lib/constants';
import { notFound } from 'next/navigation';

// Types
interface WatchlistItemType {
  symbol: string;
  [key: string]: any;
}

interface SuggestionType {
  _id: any;
  expertId: any;
  stockSymbol: string;
  suggestionType: string;
  targetPrice: number;
  confidenceScore: number;
  [key: string]: any;
}

interface StockDetailsPageProps {
  params: {
    symbol: string;
  };
}

export default async function StockDetails({ params }: StockDetailsPageProps) {
  const { symbol } = await params;
  const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;
  const auth = await getAuth();

  // Get user session
  const session = await auth.api.getSession({ headers: await headers() });

  // Fetch all data in parallel
  const [stockData, watchlist, wallet] = await Promise.all([
    getStocksDetails(symbol.toUpperCase()),
    getUserWatchlist(),
    session?.user ? getWallet(session.user.id) : { balance: 0 }
  ]);

  // Check if stockData exists
  if (!stockData) {
    notFound();
  }

  // ✅ Safe stock data with fallback values
  const safeStockData = {
    company: stockData.company || symbol.toUpperCase(),
    priceFormatted: stockData.priceFormatted || '$0.00',
    changePercent: stockData.changePercent || 0,
    changeFormatted: stockData.changeFormatted || '0%',
    marketCapFormatted: stockData.marketCapFormatted || '—',
    peRatio: stockData.peRatio || '—',
    currentPrice: stockData.currentPrice || 0
  };

  // Check watchlist status
  const isInWatchlist = (watchlist as any[]).some(
    (item: any) => item.symbol === symbol.toUpperCase()
  );

  // Expert suggestions fetch
  let stockSuggestions: any[] = [];
  try {
    await connectToDatabase();
    
    const suggestions = await ExpertSuggestion.find({
      stockSymbol: symbol.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
      .sort({ confidenceScore: -1, createdAt: -1 })
      .limit(3)
      .lean();
    
    stockSuggestions = suggestions || [];
    
  } catch (error) {
    console.error('Error fetching stock suggestions:', error);
  }

  return (
    <div className='flex flex-col min-h-screen p-4 md:p-6 lg:p-8'>
      <section className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full'>
        
        {/* Left column - Charts */}
        <div className='flex flex-col gap-6'>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}symbol-info.js`}
            config={SYMBOL_INFO_WIDGET_CONFIG(symbol)}
            height={170}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={CANDLE_CHART_WIDGET_CONFIG(symbol)}
            className='custom-chart'
            height={600}
          />

          <TradingViewWidget
            scriptUrl={`${scriptUrl}advanced-chart.js`}
            config={BASELINE_WIDGET_CONFIG(symbol)}
            className='custom-chart'
            height={600}
          />
        </div>

        {/* Right column - Stock Info + Buy/Sell + Expert Opinions */}
        <div className='flex flex-col gap-6'>
          
          {/* Stock Header with Price and Watchlist */}
          <div className='bg-gray-50 dark:bg-gray-800 p-4 rounded-lg'>
            <div className='flex justify-between items-start'>
              <div>
                <h1 className='text-2xl font-bold'>{safeStockData.company}</h1>
                <div className='flex items-center gap-3 mt-2'>
                  <span className='text-3xl font-semibold'>
                    {safeStockData.priceFormatted}
                  </span>
                  <span className={`text-lg ${
                    safeStockData.changePercent > 0 
                      ? 'text-green-600' 
                      : safeStockData.changePercent < 0 
                        ? 'text-red-600' 
                        : 'text-gray-600'
                  }`}>
                    {safeStockData.changeFormatted}
                  </span>
                </div>
                <div className='flex gap-4 mt-2 text-sm text-gray-600'>
                  <span>Market Cap: {safeStockData.marketCapFormatted}</span>
                  <span>P/E: {safeStockData.peRatio}</span>
                </div>
              </div>
              
              <WatchlistButton
                symbol={symbol}
                company={safeStockData.company}
                isInWatchlist={isInWatchlist}
                type='button'
              />
            </div>
          </div>

          {/* Price Alert Component */}
          {session?.user && (
            <div className='mt-2'>
              <PriceAlert
                symbol={symbol.toUpperCase()}
                company={safeStockData.company}
                currentPrice={safeStockData.currentPrice}
              />
            </div>
          )}

          {/* Buy/Sell Buttons */}
          {session?.user && (
            <BuySellButtons
              symbol={symbol.toUpperCase()}
              company={safeStockData.company}
              userId={session.user.id}
              currentPrice={safeStockData.currentPrice}
              availableBalance={wallet?.balance || 100000}
            />
          )}

          {/* Expert Opinions Section */}
          {stockSuggestions.length > 0 && (
            <div className='mt-4'>
              <h2 className='text-xl font-semibold mb-4'>Expert Opinions on {safeStockData.company}</h2>
              <div className='space-y-4'>
                {stockSuggestions.map((suggestion: any) => (
                  <ExpertSuggestionCard 
                    key={suggestion._id?.toString() || Math.random()}
                    suggestion={suggestion}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Technical Analysis Widget */}
          <TradingViewWidget
            scriptUrl={`${scriptUrl}technical-analysis.js`}
            config={TECHNICAL_ANALYSIS_WIDGET_CONFIG(symbol)}
            height={400}
          />

          {/* Company Profile Widget */}
          <TradingViewWidget
            scriptUrl={`${scriptUrl}company-profile.js`}
            config={COMPANY_PROFILE_WIDGET_CONFIG(symbol)}
            height={440}
          />

          {/* Financials Widget */}
          <TradingViewWidget
            scriptUrl={`${scriptUrl}financials.js`}
            config={COMPANY_FINANCIALS_WIDGET_CONFIG(symbol)}
            height={464}
          />
        </div>
      </section>

      <section className='grid grid-cols-1 xl:grid-cols-3 w-full gap-8 mt-8'>
        <div className='md:col-span-1 xl:col-span-1'>
          <TradingViewWidget
            title='Market Overview'
            scriptUrl={`${scriptUrl}market-overview.js`}
            config={MARKET_OVERVIEW_WIDGET_CONFIG}
            className='custom-chart'
            height={600}
          />
        </div>
        <div className='md:col-span-1 xl:col-span-2'>
          <TradingViewWidget
            title='Stock Heatmap'
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>

      <section className='grid grid-cols-1 xl:grid-cols-3 w-full gap-8 mt-8'>
        <div className='h-full md:col-span-1 xl:col-span-1'>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}timeline.js`}
            config={TOP_STORIES_WIDGET_CONFIG}
            height={600}
          />
        </div>
        <div className='h-full md:col-span-1 xl:col-span-2'>
          <TradingViewWidget
            scriptUrl={`${scriptUrl}market-quotes.js`}
            config={MARKET_DATA_WIDGET_CONFIG}
            height={600}
          />
        </div>
      </section>
    </div>
  );
}
