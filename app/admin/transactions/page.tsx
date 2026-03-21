'use client';

import { useState, useEffect } from 'react';
import { getAllTransactions } from '@/lib/actions/admin.actions';
import { 
  Search, 
  Filter, 
  Download,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Eye,
  MoreVertical,
  RefreshCw,
  ArrowUpDown,
  FileText,
  Printer,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [searchTerm, typeFilter, dateFilter, transactions, sortField, sortOrder]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions();
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTransactions();
    toast.success('Transactions refreshed');
  };

  const filterTransactions = () => {
    let filtered = [...transactions];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.userId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateFilter) {
        case 'today':
          filterDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(tx => new Date(tx.createdAt) >= filterDate);
    }
    
    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortField === 'total' || sortField === 'price' || sortField === 'quantity') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    setFilteredTransactions(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleViewDetails = (tx: any) => {
    setSelectedTransaction(tx);
    setShowDetailsModal(true);
  };

  const exportAsCSV = () => {
    let csv = 'Date,User ID,Stock,Type,Quantity,Price,Total\n';
    
    filteredTransactions.forEach((tx: any) => {
      const date = new Date(tx.createdAt).toLocaleDateString();
      csv += `${date},${tx.userId},${tx.symbol},${tx.type},${tx.quantity},${tx.price},${tx.total}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast.success('CSV downloaded successfully');
  };

  const printReport = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generateReportHTML());
      printWindow.document.close();
      printWindow.print();
    }
  };

  const generateReportHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Transaction Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #1a1a1a; color: #fff; }
          h1 { color: #60a5fa; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background: #2563eb; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #374151; color: #e5e7eb; }
          .buy { color: #4ade80; }
          .sell { color: #f87171; }
          .footer { margin-top: 40px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Transaction Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Transactions: ${filteredTransactions.length}</p>
        
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
            ${filteredTransactions.slice(0, 50).map((tx: any) => `
              <tr>
                <td>${new Date(tx.createdAt).toLocaleDateString()}</td>
                <td>${tx.symbol}</td>
                <td class="${tx.type === 'BUY' ? 'buy' : 'sell'}">${tx.type}</td>
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

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentTransactions = filteredTransactions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Calculate stats
  const totalBuyVolume = filteredTransactions
    .filter(tx => tx.type === 'BUY')
    .reduce((sum, tx) => sum + tx.total, 0);
  const totalSellVolume = filteredTransactions
    .filter(tx => tx.type === 'SELL')
    .reduce((sum, tx) => sum + tx.total, 0);
  const uniqueStocks = new Set(filteredTransactions.map(tx => tx.symbol)).size;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Transactions</h1>
              <p className="text-blue-100">Monitor all buy and sell activities</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
              <button
                onClick={exportAsCSV}
                className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={printReport}
                className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Total Transactions</p>
            <p className="text-3xl font-bold text-white mt-2">{filteredTransactions.length}</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Buy Volume</p>
            <p className="text-3xl font-bold text-green-400 mt-2">₹{(totalBuyVolume / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Sell Volume</p>
            <p className="text-3xl font-bold text-red-400 mt-2">₹{(totalSellVolume / 1000).toFixed(1)}K</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Unique Stocks</p>
            <p className="text-3xl font-bold text-purple-400 mt-2">{uniqueStocks}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by stock symbol or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            >
              <option value="all">All Types</option>
              <option value="BUY">Buy Only</option>
              <option value="SELL">Sell Only</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Last 24 Hours</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1">
                      Date
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('userId')}>
                    <div className="flex items-center gap-1">
                      User
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('symbol')}>
                    <div className="flex items-center gap-1">
                      Stock
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('quantity')}>
                    <div className="flex items-center gap-1">
                      Quantity
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1">
                      Price
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-blue-400" onClick={() => handleSort('total')}>
                    <div className="flex items-center gap-1">
                      Total
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-700/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-300">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-sm text-gray-300">{tx.userId.slice(-8)}</p>
                        <p className="text-xs text-gray-500">ID: {tx.userId.slice(0, 4)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-white">{tx.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-full ${
                        tx.type === 'BUY' 
                          ? 'bg-green-900/30 text-green-400 border border-green-800'
                          : 'bg-red-900/30 text-red-400 border border-red-800'
                      }`}>
                        {tx.type === 'BUY' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{tx.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-gray-300">₹{tx.price.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-blue-400">₹{tx.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(tx)}
                          className="p-2 hover:bg-blue-900/50 rounded-lg transition text-blue-400 hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:scale-110"
                          title="More Actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-700 bg-gray-900/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-400">
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2 text-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg transition font-medium ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'hover:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="px-2 text-gray-500">...</span>}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 flex items-center gap-2 text-gray-300"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Transaction Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Transaction ID</p>
                  <p className="font-mono text-sm text-white">{selectedTransaction._id}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Date & Time</p>
                  <p className="text-sm text-white">
                    {new Date(selectedTransaction.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl">
                <p className="text-xs text-gray-400 mb-2">User Information</p>
                <p className="text-sm text-white">ID: {selectedTransaction.userId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Stock</p>
                  <p className="text-xl font-bold text-white">{selectedTransaction.symbol}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Type</p>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 text-sm font-bold rounded-full ${
                    selectedTransaction.type === 'BUY' 
                      ? 'bg-green-900/30 text-green-400 border border-green-800'
                      : 'bg-red-900/30 text-red-400 border border-red-800'
                  }`}>
                    {selectedTransaction.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {selectedTransaction.type}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className="text-lg font-bold text-white">{selectedTransaction.quantity}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Price</p>
                  <p className="text-lg font-bold text-blue-400">₹{selectedTransaction.price.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-lg font-bold text-green-400">₹{selectedTransaction.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}