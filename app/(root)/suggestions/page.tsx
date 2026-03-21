import { connectToDatabase } from '@/database/mongoose';
import ExpertSuggestion from '@/database/models/expert-suggestion.model';
import ExpertSuggestionCard from '@/components/ui/ExpertSuggestionCard';
import { Search, Filter, TrendingUp, TrendingDown, Target } from 'lucide-react';

export default async function SuggestionsPage() {
  await connectToDatabase();
  
  // Get active suggestions
  const suggestions = await ExpertSuggestion.find({ 
    isActive: true,
    expiresAt: { $gt: new Date() }
  })
    .sort({ confidenceScore: -1, createdAt: -1 })
    .limit(50)
    .lean();

  // Calculate stats
  const stats = {
    total: suggestions.length,
    strongBuy: suggestions.filter(s => s.suggestionType === 'STRONG_BUY').length,
    buy: suggestions.filter(s => s.suggestionType === 'BUY').length,
    hold: suggestions.filter(s => s.suggestionType === 'HOLD').length,
    sell: suggestions.filter(s => s.suggestionType === 'SELL' || s.suggestionType === 'STRONG_SELL').length,
    avgConfidence: Math.round(
      suggestions.reduce((acc, s) => acc + s.confidenceScore, 0) / suggestions.length
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Real-time Expert Suggestions
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            AI-powered stock recommendations from top market experts, updated in real-time
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Active</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.strongBuy + stats.buy}</p>
            <p className="text-xs text-gray-600">Buy Signals</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.hold}</p>
            <p className="text-xs text-gray-600">Hold</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.sell}</p>
            <p className="text-xs text-gray-600">Sell Signals</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{stats.avgConfidence}%</p>
            <p className="text-xs text-gray-600">Avg Confidence</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by stock symbol or company..."
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
              />
            </div>
            <select className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <option>All Signals</option>
              <option>Strong Buy</option>
              <option>Buy</option>
              <option>Hold</option>
              <option>Sell</option>
              <option>Strong Sell</option>
            </select>
            <select className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <option>All Timeframes</option>
              <option>Intraday</option>
              <option>Short Term</option>
              <option>Long Term</option>
            </select>
          </div>
        </div>

        {/* Suggestions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestions.map((suggestion: any) => (
            <ExpertSuggestionCard 
              key={suggestion._id.toString()} 
              suggestion={{
                ...suggestion,
                _id: suggestion._id.toString(),
                expertId: suggestion.expertId.toString()
              }}
            />
          ))}
        </div>

        {suggestions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No active suggestions at the moment</p>
          </div>
        )}
      </div>
    </div>
  );
}