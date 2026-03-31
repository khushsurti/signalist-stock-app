'use client';

import { useState } from 'react';
import { Bell, Loader2, AlertCircle, CheckCircle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { toast } from 'sonner';

interface PriceAlertProps {
  symbol: string;
  company: string;
  currentPrice: number;
}

export default function PriceAlert({ symbol, company, currentPrice }: PriceAlertProps) {
  const [targetPrice, setTargetPrice] = useState<number>(currentPrice);
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateAlert = async () => {
    // Validation
    if (!targetPrice || targetPrice <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (targetPrice === currentPrice) {
      toast.error('Target price must be different from current price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating alert for:', { symbol, company, targetPrice, condition });

      const response = await fetch('/api/alerts/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          company,
          targetPrice,
          condition,
        }),
      });

      const data = await response.json();
      console.log('Alert creation response:', data);

      if (response.ok && data.success) {
        setSuccess(true);
        toast.success('Alert created!', {
          description: `You'll be notified when ${symbol} goes ${condition} $${targetPrice.toFixed(2)}`,
          duration: 5000,
        });
        
        // Auto close form after 2 seconds
        setTimeout(() => {
          setShowForm(false);
          setSuccess(false);
        }, 2000);
      } else {
        setError(data.error || 'Failed to create alert');
        toast.error('Failed to create alert', {
          description: data.error || 'Please try again',
        });
      }
    } catch (error) {
      console.error('Error creating alert:', error);
      setError('Network error. Please try again.');
      toast.error('Failed to create alert', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  const suggestedAlerts = [
    { label: 'Above 5%', price: currentPrice * 1.05, condition: 'above' as const },
    { label: 'Below 5%', price: currentPrice * 0.95, condition: 'below' as const },
    { label: 'Above 10%', price: currentPrice * 1.10, condition: 'above' as const },
    { label: 'Below 10%', price: currentPrice * 0.90, condition: 'below' as const },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Price Alert</h3>
              <p className="text-xs text-gray-500">Get notified when price hits target</p>
            </div>
          </div>
          {!showForm && !success && (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              + Set Alert
            </button>
          )}
        </div>

        {/* Success State */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2 animate-in fade-in duration-300">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-400">
              Alert set successfully! You'll receive an email when {symbol} reaches ${targetPrice.toFixed(2)}.
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !success && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-400 flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Alert Form */}
        {showForm && !success && (
          <div className="space-y-4 animate-in slide-in-from-top duration-300">
            {/* Condition Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setCondition('above')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  condition === 'above'
                    ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Above
              </button>
              <button
                onClick={() => setCondition('below')}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  condition === 'below'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingDown className="w-4 h-4 inline mr-1" />
                Below
              </button>
            </div>

            {/* Target Price Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                Target Price (USD)
              </label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(parseFloat(e.target.value))}
                step="0.01"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder={`e.g., ${(currentPrice * 1.1).toFixed(2)}`}
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: <span className="font-medium">${currentPrice.toFixed(2)}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreateAlert}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    Create Alert
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Suggested Alerts (when form is closed) */}
        {!showForm && !success && (
          <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
            <p className="font-medium mb-2">Suggested Alerts:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedAlerts.map((alert, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTargetPrice(alert.price);
                    setCondition(alert.condition);
                    setShowForm(true);
                  }}
                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
                >
                  {alert.condition === 'above' ? '🔔 Above' : '🔔 Below'} ${alert.price.toFixed(2)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}