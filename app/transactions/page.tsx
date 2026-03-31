import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getTransactions } from '../../lib/actions/transaction.actions';
import { ArrowDownCircle, ArrowUpCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TransactionsPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect('/sign-in');

  const transactions = await getTransactions(session.user.id);

  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups: any, tx: any) => {
    const date = new Date(tx.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(tx);
    return groups;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track all your buy and sell orders
          </p>
        </div>

        {transactions.length === 0 ? (
          // Empty State
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start trading to see your transaction history here
            </p>
            <a
              href="/search"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-medium"
            >
              Browse Stocks
            </a>
          </div>
        ) : (
          // Transactions List
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, txs]: [string, any]) => (
              <div key={date} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Date Header */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    {date}
                  </h2>
                </div>

                {/* Transactions for this date */}
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {txs.map((tx: any) => (
                    <div key={tx._id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <div className="flex items-center justify-between">
                        {/* Left side - Transaction info */}
                        <div className="flex items-center gap-4">
                          {/* Icon based on transaction type */}
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            ${tx.type === 'BUY' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600'
                            }
                          `}>
                            {tx.type === 'BUY' ? (
                              <ArrowDownCircle className="w-6 h-6" />
                            ) : (
                              <ArrowUpCircle className="w-6 h-6" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {tx.symbol}
                              </span>
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs font-medium
                                ${tx.type === 'BUY' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }
                              `}>
                                {tx.type}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {tx.quantity} shares × ${tx.price.toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {/* Right side - Amount */}
                        <div className="text-right">
                          <div className={`font-bold text-lg ${
                            tx.type === 'BUY' ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {tx.type === 'BUY' ? '-' : '+'}${tx.total.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500">
                            {new Date(tx.createdAt).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Additional details (optional) */}
                      <div className="mt-2 grid grid-cols-3 gap-4 text-xs text-gray-500 dark:text-gray-500 ml-16">
                        <div>Price per share: ${tx.price.toFixed(2)}</div>
                        <div>Total shares: {tx.quantity}</div>
                        <div>Order type: Market</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Summary Footer */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mt-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Transactions</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {transactions.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
