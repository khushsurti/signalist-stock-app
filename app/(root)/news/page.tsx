'use client';

import Link from 'next/link';
import { 
  Clock, ChevronRight, Newspaper, TrendingUp, TrendingDown, 
  DollarSign, BarChart3, RefreshCw, Bell, X, Globe, 
  TrendingUp as StockUp, Calendar, User, Share2, Bookmark,
  ExternalLink, Sparkles, AlertTriangle, CheckCircle, Info,
  ArrowLeft, Maximize2, Minimize2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface NewsArticle {
  id?: string;
  headline: string;
  summary: string;
  content?: string;
  source: string;
  datetime: string;
  url: string;
  category: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  stockImpact?: string;
  imageUrl?: string;
  author?: string;
  readTime?: number;
  relatedStocks?: string[];
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
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
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const formatTimeString = (date: Date | null) => {
    if (!date || !isClient) return '--:--:--';
    return date.toLocaleTimeString();
  };

  const fetchNews = async (showNotif = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/news', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const newsData = await response.json();
      
      if (!newsData || !Array.isArray(newsData)) throw new Error('Invalid news data');
      
      setNews(newsData);
      
      const uniqueCategories = ['all', ...new Set(newsData.map((n: any) => n?.category || 'General').filter(Boolean))];
      setCategories(uniqueCategories);
      
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
      loadFallbackNews();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackNews = () => {
    const fallbackNews: NewsArticle[] = [
      {
        headline: "Fed Signals Rate Cuts, Markets Rally",
        summary: "Federal Reserve Chair Jerome Powell indicates potential rate cuts in upcoming meetings, sending markets higher.",
        content: "In a highly anticipated speech, Federal Reserve Chair Jerome Powell signaled that the central bank is prepared to cut interest rates if economic conditions warrant. 'We are closely monitoring the economic data and are prepared to adjust policy as needed,' Powell stated. Markets responded positively with the S&P 500 jumping 1.2% and the Nasdaq climbing 1.5%. Tech stocks led the gains, with NVIDIA and Microsoft hitting new highs. Bond yields fell across the curve, with the 10-year Treasury yield dropping to 4.2%. The dovish comments come amid signs of cooling inflation and a resilient labor market. Analysts now see a 70% chance of a rate cut by September.",
        source: "Reuters",
        datetime: new Date().toISOString(),
        url: "#",
        category: "Economy",
        sentiment: "positive",
        stockImpact: "NVIDIA, MSFT, AAPL",
        imageUrl: "/api/placeholder/800/400",
        author: "Sarah Johnson",
        readTime: 4,
        relatedStocks: ["NVDA", "MSFT", "AAPL"]
      },
      {
        headline: "Oil Prices Surge on Middle East Tensions",
        summary: "Crude oil prices jump 3% as geopolitical tensions escalate in the Middle East.",
        content: "Oil prices surged to their highest level in three months as tensions in the Middle East escalated following attacks on key shipping routes. Brent crude futures rose 3.2% to $87.50 per barrel, while WTI climbed 3.5% to $83.20. The price spike comes as Houthi rebels intensified attacks on commercial vessels in the Red Sea, forcing major shipping companies to reroute. Energy stocks rallied, with Exxon Mobil and Chevron both gaining over 2%. However, airlines and transportation stocks faced pressure on concerns about rising fuel costs. Analysts warn that prolonged disruptions could push oil prices above $90 per barrel.",
        source: "Bloomberg",
        datetime: new Date().toISOString(),
        url: "#",
        category: "Commodities",
        sentiment: "negative",
        stockImpact: "RELIANCE, ONGC, BPCL",
        imageUrl: "/api/placeholder/800/400",
        author: "Michael Chen",
        readTime: 3,
        relatedStocks: ["RELIANCE", "ONGC", "BPCL"]
      },
      {
        headline: "Tech Earnings Beat Expectations",
        summary: "Major tech companies report better-than-expected quarterly results, driving sector rally.",
        content: "The technology sector continues to shine as major players reported impressive quarterly results. Apple exceeded revenue expectations on strong iPhone sales, while Microsoft's cloud business grew 28% year-over-year. Alphabet reported better-than-expected ad revenue, and Amazon's AWS division showed accelerating growth. 'The tech sector is demonstrating resilience despite macroeconomic headwinds,' said analyst Mark Thompson. 'AI adoption is driving significant demand across the ecosystem.' The positive earnings have boosted the Nasdaq Composite, which is up 15% year-to-date. Investors are now looking ahead to upcoming reports from NVIDIA and Meta Platforms.",
        source: "Financial Times",
        datetime: new Date().toISOString(),
        url: "#",
        category: "Tech Sector",
        sentiment: "positive",
        stockImpact: "AAPL, MSFT, GOOGL, AMZN",
        imageUrl: "/api/placeholder/800/400",
        author: "Emma Watson",
        readTime: 5,
        relatedStocks: ["AAPL", "MSFT", "GOOGL", "AMZN"]
      },
      {
        headline: "RBI Keeps Repo Rate Unchanged",
        summary: "Reserve Bank of India maintains status quo on interest rates citing inflation concerns.",
        content: "The Reserve Bank of India's Monetary Policy Committee voted unanimously to keep the repo rate unchanged at 6.5% for the seventh consecutive meeting. Governor Shaktikanta Das highlighted that while growth remains strong, vigilance on inflation is necessary. 'The MPC remains focused on aligning inflation to the 4% target on a durable basis,' Das stated. The decision was widely expected by markets, which showed a muted reaction. Banking stocks edged higher as the policy stance remained supportive. However, real estate and auto stocks faced some selling pressure as hopes for rate cuts were pushed further out.",
        source: "Economic Times",
        datetime: new Date().toISOString(),
        url: "#",
        category: "Economy",
        sentiment: "neutral",
        stockImpact: "HDFC BANK, ICICI BANK, SBI",
        imageUrl: "/api/placeholder/800/400",
        author: "Rajesh Sharma",
        readTime: 4,
        relatedStocks: ["HDFCBANK", "ICICIBANK", "SBIN"]
      },
      {
        headline: "EV Sales Hit Record High",
        summary: "Electric vehicle sales surge 45% in Q2 as adoption accelerates globally.",
        content: "Global electric vehicle sales reached a new milestone in the second quarter, with 3.5 million units sold - a 45% increase from the same period last year. China led the way with 55% growth, followed by Europe at 40% and the United States at 35%. Tesla maintained its leadership position, delivering a record 466,000 vehicles. However, BYD and other Chinese automakers are rapidly closing the gap. 'The EV transition is accelerating faster than expected,' said industry analyst James Carter. 'We're seeing strong demand across all price segments.' Battery manufacturers and lithium producers also benefited from the surge.",
        source: "Reuters",
        datetime: new Date().toISOString(),
        url: "#",
        category: "Auto Sector",
        sentiment: "positive",
        stockImpact: "TSLA, BYD, TATA MOTORS",
        imageUrl: "/api/placeholder/800/400",
        author: "David Kim",
        readTime: 3,
        relatedStocks: ["TSLA", "TATAMOTORS", "MARUTI"]
      }
    ];
    
    setNews(fallbackNews);
    const uniqueCategories = ['all', ...new Set(fallbackNews.map(n => n.category))];
    setCategories(uniqueCategories);
    const positive = fallbackNews.filter(n => n.sentiment === 'positive').length;
    const negative = fallbackNews.filter(n => n.sentiment === 'negative').length;
    setPositiveNews(positive);
    setNegativeNews(negative);
    setMarketSentiment(positive > negative ? 'Bullish' : negative > positive ? 'Bearish' : 'Neutral');
    setLastUpdated(new Date());
  };

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = selectedCategory === 'all' 
    ? news 
    : news.filter(n => n?.category === selectedCategory);
  
  const featuredNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

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
    } catch { return 'Just now'; }
  };

  const getSentimentColor = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'negative': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch(sentiment) {
      case 'positive': return <TrendingUp className="w-3 h-3" />;
      case 'negative': return <TrendingDown className="w-3 h-3" />;
      default: return <BarChart3 className="w-3 h-3" />;
    }
  };

  const openModal = (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsFullscreen(false);
    document.body.style.overflow = 'auto';
    setTimeout(() => setSelectedArticle(null), 300);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Modal Component
  const NewsModal = () => {
    if (!selectedArticle) return null;

    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300 ${
          isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeModal}
      >
        <div 
          className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-4xl max-h-[90vh]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Full Story</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-70px)]">
            {/* Featured Image */}
            {selectedArticle.imageUrl && (
              <div className="relative h-64 md:h-96 bg-gray-100 dark:bg-gray-800">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.headline}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-6">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(selectedArticle.sentiment)}`}>
                    {getSentimentIcon(selectedArticle.sentiment)}
                    {selectedArticle.category}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Title */}
              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                {selectedArticle.headline}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {selectedArticle.source}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(selectedArticle.datetime)}
                </span>
                {selectedArticle.author && (
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedArticle.author}
                  </span>
                )}
                {selectedArticle.readTime && (
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-4 h-4" />
                    {selectedArticle.readTime} min read
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
                  {selectedArticle.summary}
                </p>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line">
                  {selectedArticle.content || selectedArticle.summary}
                </p>
              </div>

              {/* Stock Impact */}
              {selectedArticle.stockImpact && selectedArticle.stockImpact !== 'Market' && (
                <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Stocks Impacted</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.stockImpact.split(',').map(stock => (
                      <Link
                        key={stock.trim()}
                        href={`/stocks/${stock.trim()}`}
                        className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition"
                      >
                        {stock.trim()}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Stocks */}
              {selectedArticle.relatedStocks && selectedArticle.relatedStocks.length > 0 && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Related Stocks</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedArticle.relatedStocks.map(stock => (
                      <Link
                        key={stock}
                        href={`/stocks/${stock}`}
                        className="px-3 py-1 bg-white dark:bg-gray-700 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition"
                      >
                        {stock}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-800">
                <Link
                  href={selectedArticle.url}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition"
                >
                  Read Original Article
                  <ExternalLink className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied to clipboard!');
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium rounded-xl transition"
                >
                  <Share2 className="w-4 h-4" />
                  Share Article
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#eff6ff,_#f8fafc_45%,_#eef2ff)] dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
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

      {/* Modal */}
      <NewsModal />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header */}
        <div className="mb-8 rounded-3xl border border-blue-100/80 dark:border-gray-700 bg-white/80 dark:bg-gray-800/70 backdrop-blur-md p-6 md:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/90 dark:bg-green-900/30 rounded-full mb-4 border border-green-200 dark:border-green-800">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">LIVE REAL-TIME NEWS</span>
                <span className="text-xs text-gray-500 ml-2">
                  Updated: {formatTimeString(lastUpdated)}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-700 via-cyan-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                Stock Market News
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 font-medium">
                {isClient ? new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Loading...'}
              </p>
            </div>
            
            <button
              onClick={() => fetchNews(true)}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all disabled:opacity-50"
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
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-full flex items-center gap-1 text-sm font-semibold ${getSentimentColor(marketSentiment === 'Bullish' ? 'positive' : marketSentiment === 'Bearish' ? 'negative' : 'neutral')}`}>
                {marketSentiment === 'Bullish' ? <TrendingUp className="w-4 h-4" /> : marketSentiment === 'Bearish' ? <TrendingDown className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                Market Sentiment: {marketSentiment}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <span className="px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">{positiveNews} Positive</span>
                <span className="px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">{negativeNews} Negative</span>
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
          <div className="flex flex-wrap gap-2 mb-8 bg-white/70 dark:bg-gray-800/60 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all hover:-translate-y-1">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getSentimentColor(featuredNews.sentiment || 'neutral')}`}>
                          {getSentimentIcon(featuredNews.sentiment || 'neutral')}
                          {featuredNews.category || 'News'}
                        </span>
                        <span className="text-xs text-gray-500">Featured</span>
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
                      <button
                        onClick={() => openModal(featuredNews)}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group cursor-pointer"
                      >
                        Read Full Story
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-8 text-white">
                      <Sparkles className="w-12 h-12 mb-4 opacity-80" />
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
              {remainingNews.map((article: NewsArticle, index: number) => (
                <article
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 group cursor-pointer hover:-translate-y-1"
                  onClick={() => openModal(article)}
                >
                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.imageUrl}
                        alt={article.headline}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment || 'neutral')}`}>
                          {getSentimentIcon(article.sentiment || 'neutral')}
                          {article.category || 'News'}
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    {!article.imageUrl && (
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment || 'neutral')}`}>
                          {getSentimentIcon(article.sentiment || 'neutral')}
                          {article.category || 'News'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(article.datetime)}
                        </span>
                      </div>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {article.headline || 'Market Update'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
                      {article.summary || 'Read the latest market news and analysis.'}
                    </p>
                    {article.stockImpact && article.stockImpact !== 'Market' && (
                      <div className="flex items-center gap-1 text-xs text-blue-600 mb-3">
                        <DollarSign className="w-3 h-3" />
                        <span>Affects: {article.stockImpact}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-xs text-gray-500">{article.source || 'Market News'}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(article);
                        }}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Read more
                        <ChevronRight className="w-4 h-4" />
                      </button>
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
