import { connectToDatabase } from '@/database/mongoose';
import Expert from '../../../database/models/expert.model';
import Link from 'next/link';
import { 
  Search, 
  Users, 
  TrendingUp, 
  Award, 
  Star, 
  Clock, 
  ThumbsUp,
  ChevronRight,
  Sparkles,
  Zap,
  Shield,
  Filter,
  ArrowUpRight,
  Calendar,
  BarChart3
} from 'lucide-react';

// Sample data for testing (अगर database में data नहीं है)
const sampleExperts = [
  {
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
    totalTrades: 342,
    image: null
  },
  {
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
    totalTrades: 156,
    image: null
  },
  {
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
    totalTrades: 278,
    image: null
  },
  {
    _id: '4',
    name: 'Priya Sharma',
    role: 'Crypto Analyst',
    description: 'Cryptocurrency expert specializing in Bitcoin and Ethereum analysis. Provides daily market updates.',
    experience: 4,
    followers: 8900,
    rating: 4.6,
    specialty: 'Cryptocurrency',
    expertiseAreas: ['Crypto', 'Blockchain', 'Altcoins'],
    successRate: 79,
    totalTrades: 98,
    image: null
  },
  {
    _id: '5',
    name: 'Vikram Singh',
    role: 'Equity Research Analyst',
    description: 'Equity research analyst specializing in mid-cap companies. Published in leading financial journals.',
    experience: 12,
    followers: 32100,
    rating: 4.9,
    specialty: 'Mid-cap Stocks',
    expertiseAreas: ['Mid-cap', 'Equity Research', 'Sector Analysis'],
    successRate: 88,
    totalTrades: 412,
    image: null
  },
  {
    _id: '6',
    name: 'Anjali Desai',
    role: 'Derivatives Expert',
    description: 'Derivatives trading expert with focus on options strategies and risk management.',
    experience: 7,
    followers: 6700,
    rating: 4.5,
    specialty: 'Options & Futures',
    expertiseAreas: ['Options', 'Futures', 'Hedging'],
    successRate: 82,
    totalTrades: 187,
    image: null
  }
];

export default async function ExpertsPage() {
  await connectToDatabase();
  
  // Get experts from database or use sample data
  let experts = [];
  try {
    const dbExperts = await Expert.find({ isActive: true })
      .sort({ rating: -1, followers: -1 })
      .lean();
    
    experts = dbExperts.length > 0 ? dbExperts : sampleExperts;
  } catch (error) {
    console.error('Error fetching experts:', error);
    experts = sampleExperts;
  }

  // Calculate stats
  const totalExperts = experts.length;
  const avgExperience = experts.reduce((acc, exp) => acc + (exp.experience || 0), 0) / totalExperts || 0;
  const totalFollowers = experts.reduce((acc, exp) => acc + (exp.followers || 0), 0);
  const avgSuccessRate = experts.reduce((acc, exp) => acc + (exp.successRate || 80), 0) / totalExperts || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Top Market Experts
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Market Experts
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get real-time advice and profitable recommendations from top market analysts and investment experts
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalExperts}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Active Experts</p>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Avg</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgExperience.toFixed(1)}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Years Experience</p>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalFollowers.toLocaleString()}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Followers</p>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Avg</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{avgSuccessRate.toFixed(0)}%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Success Rate</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search experts by name, role, or specialty..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-gray-900 dark:text-white placeholder-gray-500"
              />
            </div>
            <button className="px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-2 font-medium">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              All Experts
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Technical Analysis
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Fundamental Analysis
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Intraday Trading
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Long Term
            </button>
            <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Crypto
            </button>
          </div>
        </div>

        {/* Experts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert: any, index: number) => (
            <Link 
              href={`/experts/${expert._id}`} 
              key={expert._id || index}
              className="group block"
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 h-full">
                {/* Card Header with Gradient */}
                <div className="h-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative">
                  <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white dark:border-gray-800 group-hover:scale-105 transition-transform">
                        {expert.name?.charAt(0) || 'E'}
                      </div>
                      {expert.successRate > 85 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                          ★ Top
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="pt-16 p-6">
                  {/* Name and Role */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
                      {expert.name}
                    </h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {expert.role}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center">
                      <Award className="w-4 h-4 mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{expert.experience}y</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Exp</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center">
                      <Users className="w-4 h-4 mx-auto text-green-600 dark:text-green-400 mb-1" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{(expert.followers / 1000).toFixed(1)}K</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2 text-center">
                      <Star className="w-4 h-4 mx-auto text-yellow-600 dark:text-yellow-400 fill-yellow-400 mb-1" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{expert.rating}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
                    {expert.description}
                  </p>

                  {/* Expertise Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                      {expert.specialty}
                    </span>
                    {expert.expertiseAreas?.slice(0, 2).map((area: string, idx: number) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                        {area}
                      </span>
                    ))}
                  </div>

                  {/* Success Rate Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Success Rate</span>
                      <span className="text-xs font-bold text-green-600">{expert.successRate || 85}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-400"
                        style={{ width: `${expert.successRate || 85}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* View Profile Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Active Now
                    </span>
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all">
                      View Profile
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Experts Found */}
        {experts.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-16 text-center border border-gray-200 dark:border-gray-700">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Experts Found</h3>
            <p className="text-gray-600 dark:text-gray-400">Check back later for expert profiles</p>
          </div>
        )}

        {/* Load More Button */}
        {experts.length > 6 && (
          <div className="text-center">
            <button className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl shadow-lg hover:shadow-xl transition font-medium inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700">
              Load More Experts
              <ArrowUpRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}