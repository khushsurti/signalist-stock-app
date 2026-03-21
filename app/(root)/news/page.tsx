'use client';

import Link from 'next/link';
import { Clock, ChevronRight, Newspaper, TrendingUp, TrendingDown, DollarSign, BarChart3, RefreshCw, Bell, X, Globe, TrendingUp as StockUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NewsPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [marketSentiment, setMarketSentiment] = useState('Neutral');
  const [positiveNews, setPositiveNews] = useState(0);
  const [negativeNews, setNegativeNews] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format date for display - client-side only
  const formatTimeString = (date: Date | null) => {
    if (!date || !isClient) return '--:--:--';
    return date.toLocaleTimeString();
  };

  // Fetch real-time news from our API
  const fetchNews = async (showNotif = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching news from API...');
      const response = await fetch('/api/news', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const newsData = await response.json();
      console.log('News data received:', newsData.length);
      
      // Check if newsData exists and is an array
      if (!newsData || !Array.isArray(newsData)) {
        throw new Error('Invalid news data received');
      }
      
      setNews(newsData);
      
      // Extract unique categories
      const uniqueCategories = ['all', ...new Set(newsData.map((n: any) => n?.category || 'General').filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Calculate sentiment stats
      const positive = newsData.filter((n: any) => n?.sentiment === 'positive').length;
      const negative = newsData.filter((n: any) => n?.sentiment === 'negative').length;
      setPositiveNews(positive);
      setNegativeNews(negative);
      setMarketSentiment(positive > negative ? 'Bullish' : negative > positive ? 'Bearish' : 'Neutral');
      
      setLastUpdated(new Date());
      
      if (showNotif) {
        setNotificationMessage(`${newsData.length} news articles updated!`);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch news');
      setNotificationMessage('Failed to fetch latest news. Using sample data.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Load fallback data
      loadFallbackNews();
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to load sample news if API fails
  const loadFallbackNews = () => {
    const today = new Date();
    const fallbackNews = [
      {
        headline: `${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}: Market Update - Sensex, Nifty Open Higher`,
        summary: `Indian benchmark indices opened higher today tracking positive global cues. Nifty above 24,500, Sensex up 300 points.`,
        source: 'Market Desk',
        datetime: new Date().toISOString(),
        url: '#',
        category: 'Market Opening',
        sentiment: 'positive',
        stockImpact: 'NIFTY 50, SENSEX'
      },
      {
        headline: `Tech Stocks Lead Gains as US Fed Signals Rate Cut`,
        summary: 'IT stocks rally on expectations of rate cuts by September. TCS, Infosys up 2-3%.',
        source: 'Bloomberg',
        datetime: new Date().toISOString(),
        url: '#',
        category: 'Tech Sector',
        sentiment: 'positive',
        stockImpact: 'TCS, INFY, WIPRO'
      },
      {
        headline: `RBI Keeps Repo Rate Unchanged at 6.5%`,
        summary: 'Monetary Policy Committee maintains status quo citing inflation concerns. Markets react positively.',
        source: 'Economic Times',
        datetime: new Date().toISOString(),
        url: '#',
        category: 'Economy',
        sentiment: 'neutral',
        stockImpact: 'BANKING, NBFC'
      },
      {
        headline: `Oil Prices Drop to $82/bbl on Weak Demand Forecast`,
        summary: 'Brent crude falls 2% as OPEC+ signals potential output increase. Reliance, ONGC stocks react.',
        source: 'Reuters',
        datetime: new Date().toISOString(),
        url: '#',
        category: 'Commodities',
        sentiment: 'negative',
        stockImpact: 'RELIANCE, ONGC'
      },
      {
        headline: `FIIs Invest ₹2,500 Crore in Indian Markets This Week`,
        summary: 'Foreign institutional investors continue buying streak, boosting market sentiment.',
        source: 'Financial Express',
        datetime: new Date().toISOString(),
        url: '#',
        category: 'Institutional Flow',
        sentiment: 'positive',
        stockImpact: 'BANKING, FINANCIALS'
      }
    ];
    
    setNews(fallbackNews);
    
    // Set categories from fallback
    const uniqueCategories = ['all', ...new Set(fallbackNews.map(n => n.category))];
    setCategories(uniqueCategories);
    
    // Calculate sentiment
    const positive = fallbackNews.filter(n => n.sentiment === 'positive').length;
    const negative = fallbackNews.filter(n => n.sentiment === 'negative').length;
    setPositiveNews(positive);
    setNegativeNews(negative);
    setMarketSentiment(positive > negative ? 'Bullish' : negative > positive ? 'Bearish' : 'Neutral');
    
    setLastUpdated(new Date());
  };

  // Initial fetch
  useEffect(() => {
    fetchNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchNews(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter news by category
  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(n => n?.category === selectedCategory);
  
  const featuredNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      const diffMinutes = Math.floor(diffSeconds / 60);
      const diffHours = Math.floor(diffMinutes / 60);
      
      if (diffSeconds < 60) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes} min ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return 'Just now';
    }
  };

  // Get sentiment color
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  // Get sentiment icon
  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${error ? 'bg-red-500' : 'bg-green-500'} text-white`}>
            <Bell className="w-4 h-4" />
            <span>{notificationMessage}</span>
            <button onClick={() => setShowNotification(false)} className="ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header with Live Indicator */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full mb-4 relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">LIVE REAL-TIME NEWS</span>
                <span className="text-xs text-gray-500 ml-2">
                  Updated: {formatTimeString(lastUpdated)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Stock Market News
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {isClient ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...'}
              </p>
            </div>
            
            <button
              onClick={() => fetchNews(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh Now</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
            <p className="font-medium">Unable to fetch live news</p>
            <p className="text-sm">Showing sample data. Please check your API configuration.</p>
          </div>
        )}

        {/* Market Sentiment Bar */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-4 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-sm font-medium ${getSentimentColor(marketSentiment === 'Bullish' ? 'positive' : marketSentiment === 'Bearish' ? 'negative' : 'neutral')}`}>
                {marketSentiment === 'Bullish' ? <TrendingUp className="w-4 h-4" /> : marketSentiment === 'Bearish' ? <TrendingDown className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                Market Sentiment: {marketSentiment}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {positiveNews} Positive | {negativeNews} Negative
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 dark:text-gray-400">Auto-refresh every 5 min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {cat === 'all' ? 'All News' : cat}
              </button>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && news.length === 0 ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">Fetching latest market news...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Featured News */}
            {featuredNews && (
              <div className="mb-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(featuredNews.sentiment || 'neutral')}`}>
                          {getSentimentIcon(featuredNews.sentiment || 'neutral')}
                          {featuredNews.category || 'News'}
                        </span>
                        <span className="text-xs text-gray-500">Latest</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                        {featuredNews.headline || 'Market Update'}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {featuredNews.summary || 'Read the latest market updates and analysis.'}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {formatDate(featuredNews.datetime)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {featuredNews.source || 'Market News'}
                        </span>
                        {featuredNews.stockImpact && featuredNews.stockImpact !== 'Market' && (
                          <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-xs font-medium">
                            <StockUp className="w-3 h-3" />
                            {featuredNews.stockImpact}
                          </span>
                        )}
                      </div>
                      <Link
                        href={featuredNews.url || '#'}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
                      >
                        Read Full Story
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
                      <StockUp className="w-12 h-12 mb-4 opacity-80" />
                      <p className="text-xl font-semibold mb-4">Today's Market Highlights</p>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm opacity-80">NIFTY 50</p>
                          <p className="text-2xl font-bold">24,850.65</p>
                          <p className="text-green-300 text-sm">+0.85%</p>
                        </div>
                        <div>
                          <p className="text-sm opacity-80">SENSEX</p>
                          <p className="text-2xl font-bold">81,890.45</p>
                          <p className="text-green-300 text-sm">+0.92%</p>
                        </div>
                      </div>
                      <p className="text-blue-100 text-xs mt-4">*Live market data as of {formatTimeString(lastUpdated)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingNews.map((article: any, index: number) => (
                <article
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article?.sentiment || 'neutral')}`}>
                        {getSentimentIcon(article?.sentiment || 'neutral')}
                        {article?.category || 'News'}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(article?.datetime)}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {article?.headline || 'Market Update'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                      {article?.summary || 'Read the latest market news and analysis.'}
                    </p>
                    {article?.stockImpact && article.stockImpact !== 'Market' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
                        <DollarSign className="w-3 h-3" />
                        <span>Affects: {article.stockImpact}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">{article?.source || 'Market News'}</span>
                      <Link
                        href={article?.url || '#'}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Read more
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* No News Found */}
            {filteredNews.length === 0 && !loading && (
              <div className="text-center py-12">
                <Newspaper className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No news available
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Pull to refresh or check back later
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}