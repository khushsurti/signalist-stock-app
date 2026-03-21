import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Star, 
  Users, 
  Award, 
  TrendingUp, 
  Target, 
  Clock, 
  ThumbsUp,
  Calendar,
  BarChart3,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  DollarSign
} from 'lucide-react';

// Sample data (bypass database for now)
const sampleExperts: Record<string, any> = {
  '1': {
    _id: '1',
    name: 'Raj Mehta',
    role: 'Stock Analyst',
    description: 'Expert in intraday trading with 8+ years of experience. Specializes in technical analysis and momentum trading.',
    experience: 8,
    followers: 15200,
    rating: 4.8,
    specialty: 'Intraday Trading',
    expertiseAreas: ['Technical Analysis', 'Momentum Trading', 'Options'],
    successRate: 87,
    totalTrades: 342
  },
  '2': {
    _id: '2',
    name: 'Neha Shah',
    role: 'Investment Advisor',
    description: 'Certified investment advisor helping clients build long-term wealth through fundamental analysis.',
    experience: 6,
    followers: 23400,
    rating: 4.9,
    specialty: 'Long Term Stocks',
    expertiseAreas: ['Fundamental Analysis', 'Value Investing', 'Dividend'],
    successRate: 92,
    totalTrades: 156
  },
  '3': {
    _id: '3',
    name: 'Amit Patel',
    role: 'Market Expert',
    description: '10+ years of experience in technical analysis and chart patterns. Regular contributor to financial news.',
    experience: 10,
    followers: 18700,
    rating: 4.7,
    specialty: 'Technical Analysis',
    expertiseAreas: ['Chart Patterns', 'Technical Analysis', 'Swing Trading'],
    successRate: 84,
    totalTrades: 278
  }
};

// Sample suggestions
const sampleSuggestions: Record<string, any[]> = {
  '1': [
    {
      _id: 's1',
      stockSymbol: 'NVDA',
      stockName: 'NVIDIA Corporation',
      currentPrice: 19270.30,
      targetPrice: 22000,
      suggestionType: 'STRONG_BUY',
      reasoning: 'Strong AI demand, upcoming earnings beat expected. Technical indicators show strong momentum with RSI at 65 and MACD bullish crossover.',
      createdAt: new Date().toISOString(),
      confidenceScore: 92,
      potentialProfit: 14.2
    },
    {
      _id: 's2',
      stockSymbol: 'AAPL',
      stockName: 'Apple Inc.',
      currentPrice: 217.90,
      targetPrice: 235,
      suggestionType: 'BUY',
      reasoning: 'iPhone 16 launch expected to drive revenue growth. Services segment continues to expand with high margins.',
      createdAt: new Date().toISOString(),
      confidenceScore: 85,
      potentialProfit: 7.8
    }
  ],
  '2': [
    {
      _id: 's3',
      stockSymbol: 'MSFT',
      stockName: 'Microsoft Corporation',
      currentPrice: 425.50,
      targetPrice: 460,
      suggestionType: 'BUY',
      reasoning: 'Cloud growth remains strong. AI integration across products creating new revenue streams.',
      createdAt: new Date().toISOString(),
      confidenceScore: 88,
      potentialProfit: 8.1
    }
  ],
  '3': [
    {
      _id: 's4',
      stockSymbol: 'TSLA',
      stockName: 'Tesla Inc.',
      currentPrice: 398.68,
      targetPrice: 450,
      suggestionType: 'BUY',
      reasoning: 'Technical breakout pattern detected. Support at $380, resistance at $420.',
      createdAt: new Date().toISOString(),
      confidenceScore: 82,
      potentialProfit: 12.9
    }
  ]
};

interface ExpertPageProps {
  params: {
    id: string;
  };
}

export default async function ExpertProfilePage({ params }: ExpertPageProps) {
  const { id } = await params;
  
  // Get expert from sample data
  const expert = sampleExperts[id];
  
  if (!expert) {
    notFound();
  }

  // Get suggestions for this expert
  const suggestions = sampleSuggestions[id] || [];

  const getSuggestionColor = (type: string) => {
    switch(type) {
      case 'STRONG_BUY': return 'bg-gradient-to-r from-green-600 to-green-500 text-white';
      case 'BUY': return 'bg-gradient-to-r from-green-500 to-green-400 text-white';
      case 'HOLD': return 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-white';
      case 'SELL': return 'bg-gradient-to-r from-red-500 to-red-400 text-white';
      case 'STRONG_SELL': return 'bg-gradient-to-r from-red-600 to-red-500 text-white';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-400 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Back Button */}
        <Link 
          href="/experts" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Experts
        </Link>

        {/* Expert Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
          {/* Header Gradient */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-5xl shadow-2xl border-4 border-white dark:border-gray-800 transform hover:scale-105 transition-transform">
                  {expert.name.charAt(0)}
                </div>
                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                  ★ Top Expert
                </div>
              </div>
            </div>
          </div>

          {/* Expert Info */}
          <div className="pt-20 p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {expert.name}
                </h1>
                <p className="text-xl text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {expert.role}
                </p>
                
                <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-2xl text-lg leading-relaxed">
                  {expert.description}
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center min-w-[120px]">
                  <Award className="w-6 h-6 mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{expert.experience}+</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Years Exp</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-4 text-center min-w-[120px]">
                  <Users className="w-6 h-6 mx-auto text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{expert.followers.toLocaleString()}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Followers</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center min-w-[120px]">
                  <Target className="w-6 h-6 mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{expert.successRate}%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Specialty</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{expert.specialty}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Trades</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{expert.totalTrades}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Rating</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{expert.rating} / 5.0</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Member Since</p>
                    <p className="font-semibold text-gray-900 dark:text-white">2020</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expertise Tags */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Expertise Areas</h3>
              <div className="flex flex-wrap gap-2">
                {expert.expertiseAreas.map((area: string, idx: number) => (
                  <span 
                    key={idx} 
                    className="px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-700 dark:text-blue-400 text-sm rounded-xl border border-blue-200 dark:border-blue-800 shadow-sm"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {expert.name}'s Recommendations
            </h2>
            <span className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium">
              {suggestions.length} Active Signals
            </span>
          </div>
          
          {suggestions.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 text-center border border-gray-200 dark:border-gray-700">
              <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
                <TrendingUp className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Active Recommendations</h3>
              <p className="text-gray-600 dark:text-gray-400">Check back later for new trading signals</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {suggestions.map((s: any) => {
                const profit = ((s.targetPrice - s.currentPrice) / s.currentPrice) * 100;
                const isProfitable = profit > 0;

                return (
                  <div 
                    key={s._id} 
                    className="group bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  >
                    {/* Card Header */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/stocks/${s.stockSymbol}`} className="group-hover:text-blue-600 transition">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {s.stockSymbol}
                              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition" />
                            </h3>
                          </Link>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">{s.stockName}</p>
                        </div>
                        <span className={`px-4 py-2 text-sm font-bold rounded-xl ${getSuggestionColor(s.suggestionType)}`}>
                          {s.suggestionType.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Price Grid */}
                    <div className="p-6 grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          {s.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Target Price</p>
                        <p className="text-2xl font-bold text-green-600 flex items-center gap-2">
                          <Target className="w-5 h-5" />
                          {s.targetPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div className="px-6 pb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {s.reasoning}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="px-6 pb-6 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {s.confidenceScore}% Confidence
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs">{new Date(s.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/stocks/${s.stockSymbol}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium group"
                      >
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}