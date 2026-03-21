'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface PortfolioClientProps {
  initialPortfolio: any[];
  initialTotalValue: number;
  initialTotalInvestment: number;
  initialTotalProfitLoss: number;
  initialTotalProfitLossPercent: number;
}

export default function PortfolioClient({
  initialPortfolio,
  initialTotalValue,
  initialTotalInvestment,
  initialTotalProfitLoss,
  initialTotalProfitLossPercent
}: PortfolioClientProps) {
  const [portfolio, setPortfolio] = useState(initialPortfolio);
  const [totalValue, setTotalValue] = useState(initialTotalValue);
  const [totalInvestment] = useState(initialTotalInvestment);
  const [totalProfitLoss, setTotalProfitLoss] = useState(initialTotalProfitLoss);
  const [totalProfitLossPercent, setTotalProfitLossPercent] = useState(initialTotalProfitLossPercent);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchRealTimePrices = async () => {
      setIsRefreshing(true);
      try {
        const updatedPortfolio = await Promise.all(
          portfolio.map(async (item) => {
            try {
              const response = await fetch(`/api/stocks/${item.symbol}/price`);
              const data = await response.json();
              const currentPrice = data.price || item.currentPrice;
              const profitLoss = (currentPrice - item.avgPrice) * item.quantity;
              const profitLossPercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
              
              return {
                ...item,
                currentPrice,
                profitLoss,
                profitLossPercent,
                isProfit: profitLoss >= 0
              };
            } catch (error) {
              return item;
            }
          })
        );

        const newTotalValue = updatedPortfolio.reduce(
          (sum, item) => sum + (item.currentPrice * item.quantity), 0
        );
        const newTotalProfitLoss = newTotalValue - totalInvestment;
        const newTotalProfitLossPercent = totalInvestment > 0 
          ? (newTotalProfitLoss / totalInvestment) * 100 
          : 0;

        setPortfolio(updatedPortfolio);
        setTotalValue(newTotalValue);
        setTotalProfitLoss(newTotalProfitLoss);
        setTotalProfitLossPercent(newTotalProfitLossPercent);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching real-time prices:', error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchRealTimePrices();
    const interval = setInterval(fetchRealTimePrices, 10000);
    return () => clearInterval(interval);
  }, [portfolio, totalInvestment]);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 z-50">
      <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
        <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span>
          Updated: {lastUpdated.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}