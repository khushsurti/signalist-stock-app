'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Clock,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  ArrowRight,
  DollarSign,
  Percent,
  AlertCircle
} from 'lucide-react';
import { buyStock } from '@/lib/actions/buyStock';
import { toast } from 'sonner';

interface SuggestionProps {
  suggestion: {
    _id: string;
    expertId: string;
    expertName: string;
    stockSymbol: string;
    stockName: string;
    currentPrice: number;
    targetPrice: number;
    potentialProfit?: number;
    potentialProfitAmount?: number;
    suggestionType: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
    confidenceScore: number;
    reasoning: string;
    timeframe: string;
    technicalIndicators?: any;
    fundamentalFactors?: string[];
    riskFactors?: string[];
  };
  userId?: string;
  onBuyComplete?: () => void;
}

export default function ExpertSuggestionBuyCard({ 
  suggestion, 
  userId = 'demo-user',
  onBuyComplete 
}: SuggestionProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [buying, setBuying] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const potentialProfit = suggestion.potentialProfit || 
    ((suggestion.targetPrice - suggestion.currentPrice) / suggestion.currentPrice) * 100;
  
  const isProfitable = potentialProfit > 0;

  const getSuggestionColor = () => {
    if (suggestion.suggestionType.includes('STRONG_BUY')) return 'bg-green-600';
    if (suggestion.suggestionType.includes('BUY')) return 'bg-green-500';
    if (suggestion.suggestionType === 'HOLD') return 'bg-yellow-500';
    if (suggestion.suggestionType.includes('SELL')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getProfitColor = () => {
    if (potentialProfit > 15) return 'text-green-600';
    if (potentialProfit > 5) return 'text-green-500';
    if (potentialProfit > 0) return 'text-green-400';
    return 'text-red-500';
  };

  const handleBuy = async () => {
    if (!userId) {
      toast.error('Please sign in to buy');
      router.push('/sign-in');
      return;
    }

    setBuying(true);
    try {
      const result = await buyStock(
        userId,
        suggestion.stockSymbol,
        suggestion.stockName,
        suggestion.currentPrice,
        quantity
      );

      if (result.success) {
        toast.success('Stock Purchased!', {
          description: `Bought ${quantity} shares of ${suggestion.stockSymbol}`,
        });
        router.refresh();
        onBuyComplete?.();
      } else {
        toast.error('Purchase Failed', {
          description: result.error || 'Something went wrong',
        });
      }
    } catch (error) {
      toast.error('Failed to buy stock');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with Expert Info */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Link href={`/experts/${suggestion.expertId}`}>
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {suggestion.expertName?.charAt(0) || 'E'}
              </div>
            </Link>
            <div>
              <Link href={`/experts/${suggestion.expertId}`}>
                <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                  {suggestion.expertName}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">Market Expert</p>
            </div>
          </div>
          <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${getSuggestionColor()}`}>
            {suggestion.suggestionType.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Stock Info */}
      <div className="p-4">
        <Link href={`/stocks/${suggestion.stockSymbol}`} className="block group">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition">
            {suggestion.stockSymbol}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">{suggestion.stockName}</p>
        </Link>

        {/* Price & Profit Info */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Current Price</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              ${suggestion.currentPrice.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Price</p>
            <p className="text-2xl font-bold text-green-600">
              ${suggestion.targetPrice.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Profit Potential */}
        <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <Target className="w-4 h-4" />
              Potential Profit
            </span>
            <div className="text-right">
              <span className={`text-2xl font-bold ${getProfitColor()}`}>
                {potentialProfit > 0 ? '+' : ''}{potentialProfit.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                (${Math.abs(suggestion.targetPrice - suggestion.currentPrice).toFixed(2)})
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {suggestion.timeframe}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${suggestion.confidenceScore > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} />
            {suggestion.confidenceScore}% Confidence
          </div>
        </div>

        {/* Reasoning */}
        <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
          {suggestion.reasoning}
        </p>

        {/* Expandable Details */}
        {expanded && (
          <div className="mt-4 space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            {suggestion.fundamentalFactors && suggestion.fundamentalFactors.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Key Factors</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                  {suggestion.fundamentalFactors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}

            {suggestion.riskFactors && suggestion.riskFactors.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Risk Factors
                </h4>
                <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-300 mt-1">
                  {suggestion.riskFactors.map((risk, idx) => (
                    <li key={idx}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Buy Section */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center border rounded-md p-1 dark:bg-gray-800 dark:border-gray-700"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Cost:</span>
            <span className="text-xl font-bold text-blue-600">
              ${(suggestion.currentPrice * quantity).toFixed(2)}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleBuy}
              disabled={buying}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {buying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Buying...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  Buy {quantity} Share{quantity > 1 ? 's' : ''}
                </>
              )}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Estimated Profit on Buy */}
          {potentialProfit > 0 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Estimated Profit: 
                <span className="font-bold text-green-600 ml-1">
                  ${((suggestion.targetPrice - suggestion.currentPrice) * quantity).toFixed(2)} 
                  ({potentialProfit.toFixed(2)}%)
                </span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}