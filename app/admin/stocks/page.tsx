'use client';

import { useState, useEffect } from 'react';
import { 
  getAllStocks, 
  addStock, 
  deleteStock,
  updateStock 
} from '@/lib/actions/admin.actions';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  X,
  Check,
  AlertTriangle,
  Save,
  Eye,
  Copy,
  Star,
  Archive,
  DollarSign,
  BarChart3,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Stock {
  symbol: string;
  name: string;
  exchange: string;
  priceFormatted: string;
  changePercent: number;
  changeFormatted: string;
}

export default function StocksPage() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form states for add/edit
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    exchange: 'NASDAQ',
    price: '',
    change: ''
  });

  const stocksPerPage = 10;

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    let filtered = stocks;
    
    if (searchTerm) {
      filtered = filtered.filter(stock => 
        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (exchangeFilter !== 'all') {
      filtered = filtered.filter(stock => stock.exchange === exchangeFilter);
    }
    
    setFilteredStocks(filtered);
    setCurrentPage(1);
  }, [searchTerm, exchangeFilter, stocks]);

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const data = await getAllStocks();
      setStocks(data || []);
      setFilteredStocks(data || []);
      toast.success('Stocks loaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load stocks');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStocks();
    toast.success('Stocks list refreshed');
  };

  // ============================================
  // ADD STOCK
  // ============================================
  const handleAddStock = async () => {
    if (!formData.symbol || !formData.name || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    setSaving(true);
    try {
      const result = await addStock({
        symbol: formData.symbol.toUpperCase(),
        name: formData.name,
        exchange: formData.exchange,
        price: parseFloat(formData.price)
      });

      if (result.success) {
        toast.success('Stock added successfully');
        setShowAddModal(false);
        resetForm();
        fetchStocks();
      } else {
        toast.error(result.error || 'Failed to add stock');
      }
    } catch (error) {
      toast.error('Failed to add stock');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // EDIT STOCK
  // ============================================
  const handleEditStock = async () => {
    if (!selectedStock) return;
    
    setSaving(true);
    try {
      const result = await updateStock(selectedStock.symbol, {
        name: formData.name || selectedStock.name,
        exchange: formData.exchange || selectedStock.exchange,
        price: parseFloat(formData.price) || parseFloat(selectedStock.priceFormatted.replace('$', '').replace(',', ''))
      });

      if (result.success) {
        toast.success('Stock updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchStocks();
      } else {
        toast.error(result.error || 'Failed to update stock');
      }
    } catch (error) {
      toast.error('Failed to update stock');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // DELETE STOCK - FIX 2 & 5 (Improved Version)
  // ============================================
  const handleDeleteStock = async () => {
    if (!selectedStock) return;
    
    setDeleting(true);
    try {
      console.log(`🗑️ Attempting to delete stock: ${selectedStock.symbol}`);
      
      const result = await deleteStock(selectedStock.symbol);
      
      if (result.success) {
        toast.success('Stock deleted successfully', {
          description: `${selectedStock.symbol} has been removed from the system`
        });
        
        // Close modal
        setShowDeleteModal(false);
        
        // FIX 5: IMMEDIATELY remove from local state (optimistic update)
        setStocks(prevStocks => {
          const filtered = prevStocks.filter(s => s.symbol !== selectedStock.symbol);
          console.log(`📊 Updated stocks count: ${filtered.length}`);
          return filtered;
        });
        
        // Also refresh from server after a short delay
        setTimeout(() => {
          fetchStocks();
        }, 1000);
        
      } else {
        toast.error('Failed to delete stock', {
          description: result.error || 'Please try again'
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('An error occurred while deleting stock');
    } finally {
      setDeleting(false);
      setSelectedStock(null);
    }
  };

  // ============================================
  // OTHER ACTIONS
  // ============================================
  const handleViewStock = (stock: Stock) => {
    setSelectedStock(stock);
    setShowViewModal(true);
  };

  const handleCopySymbol = (symbol: string) => {
    navigator.clipboard.writeText(symbol);
    toast.success(`Symbol ${symbol} copied to clipboard`);
  };

  const handleAddToWatchlist = (stock: Stock) => {
    toast.success(`${stock.symbol} added to watchlist`);
    setShowActionsMenu(null);
  };

  const handleViewChart = (stock: Stock) => {
    window.open(`/stocks/${stock.symbol}`, '_blank');
    setShowActionsMenu(null);
  };

  const handleExportStock = (stock: Stock) => {
    const data = `${stock.symbol},${stock.name},${stock.exchange},${stock.priceFormatted},${stock.changeFormatted}\n`;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${stock.symbol}-data.csv`;
    a.click();
    toast.success(`${stock.symbol} data exported`);
    setShowActionsMenu(null);
  };

  const openEditModal = (stock: Stock) => {
    setSelectedStock(stock);
    setFormData({
      symbol: stock.symbol,
      name: stock.name,
      exchange: stock.exchange,
      price: stock.priceFormatted.replace('$', '').replace(',', ''),
      change: stock.changeFormatted
    });
    setShowEditModal(true);
    setShowActionsMenu(null);
  };

  const openDeleteModal = (stock: Stock) => {
    setSelectedStock(stock);
    setShowDeleteModal(true);
    setShowActionsMenu(null);
  };

  const resetForm = () => {
    setFormData({
      symbol: '',
      name: '',
      exchange: 'NASDAQ',
      price: '',
      change: ''
    });
    setSelectedStock(null);
  };

  // Get unique exchanges for filter
  const exchanges = ['all', ...new Set(stocks.map(s => s.exchange))];

  // Pagination
  const indexOfLast = currentPage * stocksPerPage;
  const indexOfFirst = indexOfLast - stocksPerPage;
  const currentStocks = filteredStocks.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredStocks.length / stocksPerPage);

  // Calculate stats
  const gainers = stocks.filter(s => s.changePercent > 0).length;
  const losers = stocks.filter(s => s.changePercent < 0).length;

  const getChangeColor = (percent: number) => {
    return percent > 0 ? 'text-green-400' : percent < 0 ? 'text-red-400' : 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Loading stocks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Add Button */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Stocks Management</h1>
              <p className="text-blue-100">Manage all available stocks in the market</p>
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
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Stock
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Total Stocks</p>
            <p className="text-3xl font-bold text-white mt-2">{stocks.length}</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Exchanges</p>
            <p className="text-3xl font-bold text-white mt-2">{exchanges.length - 1}</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Gainers Today</p>
            <p className="text-3xl font-bold text-green-400 mt-2">{gainers}</p>
          </div>
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
            <p className="text-sm text-gray-400">Losers Today</p>
            <p className="text-3xl font-bold text-red-400 mt-2">{losers}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by symbol or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500"
              />
            </div>
            <select
              value={exchangeFilter}
              onChange={(e) => setExchangeFilter(e.target.value)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
            >
              {exchanges.map(ex => (
                <option key={ex} value={ex}>
                  {ex === 'all' ? 'All Exchanges' : ex}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stocks Table */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Symbol</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Company</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Exchange</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Current Price</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Change</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-gray-700/50 transition group">
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-white">{stock.symbol}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300">{stock.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-xs">
                        {stock.exchange}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-medium text-white">{stock.priceFormatted}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-medium ${getChangeColor(stock.changePercent)}`}>
                        {stock.changePercent > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : stock.changePercent < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : null}
                        {stock.changeFormatted}
                      </span>
                    </td>
                    <td className="px-6 py-4 relative">
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => handleViewStock(stock)}
                          className="p-2 hover:bg-blue-900/50 rounded-lg transition text-blue-400 hover:scale-110"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(stock)}
                          className="p-2 hover:bg-yellow-900/50 rounded-lg transition text-yellow-400 hover:scale-110"
                          title="Edit Stock"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => openDeleteModal(stock)}
                          className="p-2 hover:bg-red-900/50 rounded-lg transition text-red-400 hover:scale-110"
                          title="Delete Stock"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        {/* More Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() => setShowActionsMenu(showActionsMenu === stock.symbol ? null : stock.symbol)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition text-gray-400 hover:scale-110"
                            title="More Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {showActionsMenu === stock.symbol && (
                            <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 z-50">
                              <div className="py-1">
                                <button
                                  onClick={() => handleCopySymbol(stock.symbol)}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                                >
                                  <Copy className="w-4 h-4 text-blue-400" />
                                  Copy Symbol
                                </button>
                                <button
                                  onClick={() => handleAddToWatchlist(stock)}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                                >
                                  <Star className="w-4 h-4 text-yellow-400" />
                                  Add to Watchlist
                                </button>
                                <button
                                  onClick={() => handleViewChart(stock)}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                                >
                                  <BarChart3 className="w-4 h-4 text-purple-400" />
                                  View Chart
                                </button>
                                <button
                                  onClick={() => handleExportStock(stock)}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                                >
                                  <Download className="w-4 h-4 text-green-400" />
                                  Export Data
                                </button>
                                <div className="border-t border-gray-700 my-1"></div>
                                <button
                                  onClick={() => openEditModal(stock)}
                                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-3"
                                >
                                  <Edit className="w-4 h-4 text-yellow-400" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => openDeleteModal(stock)}
                                  className="w-full px-4 py-3 text-left text-sm text-red-400 hover:bg-red-900/30 flex items-center gap-3"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
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
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredStocks.length)} of {filteredStocks.length} stocks
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

      {/* View Stock Modal */}
      {showViewModal && selectedStock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Stock Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-400">Symbol</p>
                  <p className="text-2xl font-bold text-white">{selectedStock.symbol}</p>
                </div>
                <span className="px-3 py-1 bg-blue-900/30 text-blue-400 rounded-full text-sm">
                  {selectedStock.exchange}
                </span>
              </div>

              <div className="p-4 bg-gray-900/50 rounded-xl">
                <p className="text-sm text-gray-400 mb-1">Company Name</p>
                <p className="text-lg text-white">{selectedStock.name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold text-blue-400">{selectedStock.priceFormatted}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400">Change</p>
                  <p className={`text-2xl font-bold ${getChangeColor(selectedStock.changePercent)}`}>
                    {selectedStock.changeFormatted}
                  </p>
                </div>
              </div>

              <Link
                href={`/stocks/${selectedStock.symbol}`}
                className="block w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium text-center"
                onClick={() => setShowViewModal(false)}
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Stock</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Symbol *</label>
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => setFormData({...formData, symbol: e.target.value.toUpperCase()})}
                  placeholder="e.g., AAPL"
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Apple Inc."
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
                <select
                  value={formData.exchange}
                  onChange={(e) => setFormData({...formData, exchange: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NSE">NSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="e.g., 175.34"
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-gray-700 transition font-medium text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStock}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Add Stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stock Modal */}
      {showEditModal && selectedStock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Edit Stock</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stock Symbol</label>
                <input
                  type="text"
                  value={formData.symbol}
                  readOnly
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exchange</label>
                <select
                  value={formData.exchange}
                  onChange={(e) => setFormData({...formData, exchange: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="NASDAQ">NASDAQ</option>
                  <option value="NYSE">NYSE</option>
                  <option value="BSE">BSE</option>
                  <option value="NSE">NSE</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Current Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    resetForm();
                  }}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-gray-700 transition font-medium text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditStock}
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Stock
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal - FIX 3 (Updated Design) */}
      {showDeleteModal && selectedStock && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Delete Stock</h2>
                  <p className="text-red-200 text-sm mt-1">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3 bg-red-900/20 p-4 rounded-xl border border-red-800">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">Warning</p>
                  <p className="text-sm text-red-300 mt-1">
                    You are about to delete <span className="font-bold">{selectedStock.symbol}</span> - {selectedStock.name}
                  </p>
                  <p className="text-xs text-red-400 mt-2">
                    This will permanently remove this stock and all related data from the system.
                  </p>
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">Stock to delete:</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold">
                    {selectedStock.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{selectedStock.symbol}</p>
                    <p className="text-sm text-gray-400">{selectedStock.name}</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-400">
                Are you sure you want to delete this stock?
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedStock(null);
                  }}
                  disabled={deleting}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-gray-700 transition font-medium text-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteStock}
                  disabled={deleting}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}