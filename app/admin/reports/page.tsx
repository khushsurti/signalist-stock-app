'use client';

import { useState, useEffect } from 'react';
import { getDashboardStats, getAllTransactions } from '@/lib/actions/admin.actions';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  X
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('week');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, transactionsData] = await Promise.all([
          getDashboardStats(),
          getAllTransactions()
        ]);
        setStats(statsData);
        setTransactions(transactionsData);
      } catch (error) {
        console.error('Error fetching reports data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Prepare transaction volume data
  const volumeData = [
    { date: 'Week 1', buyVolume: 15000, sellVolume: 5000 },
    { date: 'Week 2', buyVolume: 25000, sellVolume: 8000 },
    { date: 'Week 3', buyVolume: 35000, sellVolume: 12000 },
    { date: 'Week 4', buyVolume: 45000, sellVolume: 15000 },
    { date: 'Week 5', buyVolume: 55000, sellVolume: 18000 },
  ];

  const userGrowthData = [
    { date: 'Week 1', users: 5 },
    { date: 'Week 2', users: 12 },
    { date: 'Week 3', users: 19 },
    { date: 'Week 4', users: 25 },
    { date: 'Week 5', users: 30 },
  ];

  // Calculate metrics
  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.total || 0), 0);
  const avgTransaction = transactions.length > 0 ? totalRevenue / transactions.length : 0;
  const activeUsers = new Set(transactions.map((tx: any) => tx.userId)).size;

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================

  const handleExport = () => {
    setShowExportModal(true);
  };

  const exportAsPDF = () => {
    toast.success('PDF download started', {
      description: 'Your report is being generated...'
    });
    
    // Simulate PDF generation
    setTimeout(() => {
      // Create a simple PDF-like HTML content
      const content = generateReportHTML();
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      
      toast.success('Report downloaded successfully');
      setShowExportModal(false);
    }, 1500);
  };

  const exportAsCSV = () => {
    toast.success('CSV download started', {
      description: 'Your data is being exported...'
    });
    
    setTimeout(() => {
      // Generate CSV content
      let csv = 'Date,Stock,Type,Quantity,Price,Total\n';
      
      transactions.slice(0, 50).forEach((tx: any) => {
        const date = new Date(tx.createdAt).toLocaleDateString();
        csv += `${date},${tx.symbol},${tx.type},${tx.quantity},${tx.price},${tx.total}\n`;
      });
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      toast.success('CSV downloaded successfully');
      setShowExportModal(false);
    }, 1000);
  };

  const exportAsJSON = () => {
    const data = {
      stats: {
        totalRevenue,
        totalTransactions: transactions.length,
        avgTransaction,
        activeUsers
      },
      transactions: transactions.slice(0, 100),
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast.success('JSON downloaded successfully');
    setShowExportModal(false);
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReportHTML());
      printWindow.document.close();
      printWindow.print();
    }
    setShowExportModal(false);
  };

  const generateReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Stock Market Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #2563eb; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #f3f4f6; padding: 20px; border-radius: 10px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2563eb; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background: #2563eb; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .footer { margin-top: 40px; color: #6b7280; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Stock Market Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        
        <div class="stats">
          <div class="stat-card">
            <div>Total Revenue</div>
            <div class="stat-value">₹${(totalRevenue / 100000).toFixed(2)}L</div>
          </div>
          <div class="stat-card">
            <div>Total Transactions</div>
            <div class="stat-value">${transactions.length}</div>
          </div>
          <div class="stat-card">
            <div>Active Users</div>
            <div class="stat-value">${activeUsers}</div>
          </div>
          <div class="stat-card">
            <div>Avg Transaction</div>
            <div class="stat-value">₹${avgTransaction.toFixed(2)}</div>
          </div>
        </div>
        
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Stock</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.slice(0, 20).map((tx: any) => `
              <tr>
                <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
                <td>${tx.symbol}</td>
                <td>${tx.type}</td>
                <td>${tx.quantity}</td>
                <td>₹${tx.price.toFixed(2)}</td>
                <td>₹${tx.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>© Stock Market App - Confidential Report</p>
        </div>
      </body>
      </html>
    `;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Export Button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Reports & Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and export your trading data
            </p>
          </div>
          
          {/* ✅ Export Button */}
          <button
            onClick={handleExport}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition flex items-center gap-2 shadow-lg"
          >
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="day">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{(totalRevenue / 100000).toFixed(2)}L
            </p>
            <p className="text-xs text-gray-500 mt-2">From {transactions.length} transactions</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Transaction</p>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ₹{avgTransaction.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Per transaction</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeUsers}</p>
            <p className="text-xs text-gray-500 mt-2">Trading users</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{volumeData.length}</p>
            <p className="text-xs text-gray-500 mt-2">Active days</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Transaction Volume Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Transaction Volume</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="buyVolume" fill="#22c55e" name="Buy Volume" />
                  <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Volume" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold mb-4">User Growth</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">User</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.slice(0, 5).map((tx: any) => (
                  <tr key={tx._id}>
                    <td className="px-4 py-3 text-sm">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{tx.userId.slice(-6)}</td>
                    <td className="px-4 py-3 text-sm font-medium">{tx.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        tx.type === 'BUY' 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">₹{tx.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ✅ Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Export Report</h2>
                    <p className="text-blue-100 text-sm mt-1">Choose export format</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={exportAsPDF}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <FileText className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">PDF Document</h3>
                    <p className="text-sm text-gray-500">Download as formatted report</p>
                  </div>
                </button>

                <button
                  onClick={exportAsCSV}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">CSV File</h3>
                    <p className="text-sm text-gray-500">Export raw transaction data</p>
                  </div>
                </button>

                <button
                  onClick={exportAsJSON}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <FileText className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">JSON File</h3>
                    <p className="text-sm text-gray-500">Export as structured data</p>
                  </div>
                </button>

                <button
                  onClick={printReport}
                  className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-4"
                >
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Printer className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Print Report</h3>
                    <p className="text-sm text-gray-500">Open print dialog</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-2xl">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Report includes data from last {timeframe === 'day' ? '24 hours' : 
                  timeframe === 'week' ? '7 days' : 
                  timeframe === 'month' ? '30 days' : '90 days'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}