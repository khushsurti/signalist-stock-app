import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getPortfolio } from '@/lib/actions/portfolio.actions';
import { getWallet } from '@/lib/actions/wallet.actions';
import { getStocksDetails } from '@/lib/actions/finnhub.actions';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Wallet, PieChart, ArrowRight, DollarSign, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  const portfolio = await getPortfolio(session.user.id);
  const wallet = await getWallet(session.user.id);

  // Fetch current prices for each stock
  const portfolioWithPrices = await Promise.all(
    portfolio.map(async (item: any) => {
      const currentData = await getStocksDetails(item.symbol);
      const currentPrice = currentData?.currentPrice || item.avgPrice;
      const profitLoss = (currentPrice - item.avgPrice) * item.quantity;
      const profitLossPercent = ((currentPrice - item.avgPrice) / item.avgPrice) * 100;
      
      return {
        ...item,
        currentPrice,
        profitLoss,
        profitLossPercent,
        isProfit: profitLoss >= 0
      };
    })
  );

  // Total Investment - जितना पैसा लगाया
  const totalInvestment = portfolioWithPrices.reduce(
    (sum, item) => sum + (item.avgPrice * item.quantity), 0
  );

  // Current Value - अभी के भाव से value
  const totalValue = portfolioWithPrices.reduce(
    (sum, item) => sum + (item.currentPrice * item.quantity), 0
  );

  // ✅ Available Balance = Wallet Balance - Total Investment
  const walletBalance = wallet?.balance || 0;
  const availableBalance = walletBalance - totalInvestment;

  const totalProfitLoss = totalValue - totalInvestment;
  const totalProfitLossPercent = totalInvestment > 0 
    ? (totalProfitLoss / totalInvestment) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track your investments and performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          
          {/* Card 1: Available Balance - जो बचा है wallet में */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Ready to Invest</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {/* ✅ Available Balance = Wallet - Investment */}
                ${availableBalance.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Available balance
              </p>
            </div>
          </div>

          {/* Card 2: Total Investment */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Invested</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalInvestment.toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total cost basis
              </p>
            </div>
          </div>

          {/* Card 3: Current Value */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Current</span>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalValue.toFixed(2)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-sm font-medium ${
                  totalProfitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLoss.toFixed(2)} USD
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  totalProfitLoss >= 0 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {totalProfitLoss >= 0 ? '+' : ''}{totalProfitLossPercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Holdings */}
        {portfolioWithPrices.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No stocks in portfolio
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start investing to build your portfolio
            </p>
            <Link
              href="/search"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Browse Stocks
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Holdings ({portfolioWithPrices.length})
            </h2>
            
            {portfolioWithPrices.map((item) => (
              <Link
                key={item.symbol}
                href={`/stocks/${item.symbol}`}
                className="block group"
              >
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all hover:border-blue-200 dark:hover:border-blue-800">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    
                    {/* Stock Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg">
                        {item.symbol.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.company}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.symbol}
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
                      
                      {/* Shares */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Shares</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {item.quantity}
                        </p>
                      </div>

                      {/* Avg Price */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Avg Price</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${item.avgPrice.toFixed(2)}
                        </p>
                      </div>

                      {/* Current Price */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Current</p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${item.currentPrice.toFixed(2)}
                        </p>
                      </div>

                      {/* Profit/Loss */}
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">P/L</p>
                        <div>
                          <p className={`text-lg font-semibold ${
                            item.isProfit ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.isProfit ? '+' : ''}{item.profitLoss.toFixed(2)}
                          </p>
                          <p className={`text-xs ${
                            item.isProfit ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.isProfit ? '+' : ''}{item.profitLossPercent.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Total Value */}
                    <div className="text-right md:min-w-[120px]">
                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-1">Total Value</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        ${(item.currentPrice * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Invested: ${(item.avgPrice * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
