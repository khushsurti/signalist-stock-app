'use client';

import { useState, useEffect } from 'react';
import { 
  getAllWallets, 
  getWalletStats,
  updateWalletBalance,
  freezeWallet,
  deleteWallet 
} from '@/lib/actions/admin.actions';
import { 
  Search, 
  Wallet, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Filter,
  Download,
  Clock,
  Mail,
  Activity,
  X,
  AlertCircle,
  Ban,
  CheckCircle,
  Loader2,
  Edit,
  Trash2,
  Lock,
  Unlock,
  FileSpreadsheet,
  FileText,
  Printer
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface WalletStats {
  totalBalance: number;
  totalWallets: number;
  avgBalance: number;
  activeWallets: number;
  highestBalance: number;
  highestBalanceUser?: string;
}

interface WalletData {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  transactionCount: number;
  lastActive: string;
  createdAt: string;
  isFrozen?: boolean;
}

export default function WalletsPage() {
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [filteredWallets, setFilteredWallets] = useState<WalletData[]>([]);
  const [stats, setStats] = useState<WalletStats>({
    totalBalance: 0,
    totalWallets: 0,
    avgBalance: 0,
    activeWallets: 0,
    highestBalance: 0,
    highestBalanceUser: 'Unknown'
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  
  const walletsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterWallets();
  }, [searchTerm, statusFilter, wallets]);

  const fetchData = async () => {
    try {
      const [walletsData, statsData] = await Promise.all([
        getAllWallets(),
        getWalletStats()
      ]);
      
      setWallets(walletsData || []);
      setFilteredWallets(walletsData || []);
      
      if (statsData) {
        setStats({
          totalBalance: statsData.totalBalance || 0,
          totalWallets: statsData.totalWallets || 0,
          avgBalance: statsData.avgBalance || 0,
          activeWallets: statsData.activeWallets || 0,
          highestBalance: statsData.highestBalance || 0,
          highestBalanceUser: statsData.highestBalanceUser || 'Unknown'
        });
      }
      
      toast.success('Wallet data refreshed');
    } catch (error) {
      console.error('Error fetching wallets:', error);
      toast.error('Failed to load wallets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  // ============================================
  // EXPORT FUNCTIONALITY
  // ============================================
  
  const exportAsCSV = () => {
    setExporting(true);
    
    setTimeout(() => {
      try {
        // Headers
        let csv = 'User Name,User Email,Balance,Transaction Count,Last Active,Status\n';
        
        // Data rows
        filteredWallets.forEach((wallet) => {
          const status = wallet.isFrozen ? 'Frozen' : 
                        wallet.balance > 10000 ? 'High' :
                        wallet.balance > 1000 ? 'Active' : 'Low';
          
          csv += `"${wallet.userName}","${wallet.userEmail}",${wallet.balance},${wallet.transactionCount},"${wallet.lastActive}",${status}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallets-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        
        toast.success('CSV downloaded successfully');
      } catch (error) {
        toast.error('Failed to export data');
      } finally {
        setExporting(false);
        setShowExportModal(false);
      }
    }, 500);
  };

  const exportAsJSON = () => {
    setExporting(true);
    
    setTimeout(() => {
      try {
        const data = {
          stats,
          wallets: filteredWallets,
          exportedAt: new Date().toISOString(),
          totalCount: filteredWallets.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wallets-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        toast.success('JSON downloaded successfully');
      } catch (error) {
        toast.error('Failed to export data');
      } finally {
        setExporting(false);
        setShowExportModal(false);
      }
    }, 500);
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
        <title>Wallet Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #1a1a1a; color: #fff; }
          h1 { color: #60a5fa; }
          h2 { color: #c084fc; margin-top: 30px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
          .stat-card { background: #2d2d2d; padding: 20px; border-radius: 10px; border-left: 4px solid #3b82f6; }
          .stat-value { font-size: 24px; font-weight: bold; color: #60a5fa; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background: #3b82f6; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #404040; color: #e5e7eb; }
          .high { color: #4ade80; }
          .active { color: #facc15; }
          .low { color: #94a3b8; }
          .frozen { color: #ef4444; }
          .footer { margin-top: 40px; color: #9ca3af; text-align: center; }
        </style>
      </head>
      <body>
        <h1>Wallet Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <p>Total Wallets: ${filteredWallets.length}</p>
        
        <h2>Statistics</h2>
        <div class="stats">
          <div class="stat-card">
            <div>Total Balance</div>
            <div class="stat-value">₹${(stats.totalBalance / 100000).toFixed(2)}L</div>
          </div>
          <div class="stat-card">
            <div>Average Balance</div>
            <div class="stat-value">₹${stats.avgBalance.toFixed(2)}</div>
          </div>
          <div class="stat-card">
            <div>Active Wallets</div>
            <div class="stat-value">${stats.activeWallets}</div>
          </div>
          <div class="stat-card">
            <div>Highest Balance</div>
            <div class="stat-value">₹${stats.highestBalance.toFixed(2)}</div>
          </div>
        </div>
        
        <h2>Wallet Details</h2>
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Balance</th>
              <th>Transactions</th>
              <th>Last Active</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredWallets.map((wallet) => {
              const status = wallet.isFrozen ? 'Frozen' : 
                            wallet.balance > 10000 ? 'High' :
                            wallet.balance > 1000 ? 'Active' : 'Low';
              const statusClass = wallet.isFrozen ? 'frozen' :
                                  wallet.balance > 10000 ? 'high' :
                                  wallet.balance > 1000 ? 'active' : 'low';
              return `
                <tr>
                  <td>${wallet.userName}</td>
                  <td>${wallet.userEmail}</td>
                  <td>₹${wallet.balance.toFixed(2)}</td>
                  <td>${wallet.transactionCount}</td>
                  <td>${wallet.lastActive}</td>
                  <td class="${statusClass}">${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>© Stock Market App - Confidential Report</p>
        </div>
      </body>
      </html>
    `;
  };

  const filterWallets = () => {
    let filtered = wallets;
    
    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        w.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(w => {
        if (statusFilter === 'high') return w.balance > 10000;
        if (statusFilter === 'active') return w.balance > 1000 && w.balance <= 10000;
        if (statusFilter === 'low') return w.balance <= 1000;
        if (statusFilter === 'frozen') return w.isFrozen;
        return true;
      });
    }
    
    setFilteredWallets(filtered);
    setCurrentPage(1);
  };

  const handleViewDetails = (wallet: WalletData) => {
    setSelectedWallet(wallet);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (balance: number, isFrozen?: boolean) => {
    if (isFrozen) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-700 text-gray-300 border border-gray-600">
          <Ban className="w-3 h-3" />
          Frozen
        </span>
      );
    }
    if (balance > 10000) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-green-900/30 text-green-400 border border-green-800">
          <Activity className="w-3 h-3" />
          High
        </span>
      );
    }
    if (balance > 1000) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-yellow-900/30 text-yellow-400 border border-yellow-800">
          <Activity className="w-3 h-3" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-800 text-gray-400 border border-gray-700">
        <Activity className="w-3 h-3" />
        Low
      </span>
    );
  };

  // Pagination
  const indexOfLast = currentPage * walletsPerPage;
  const indexOfFirst = indexOfLast - walletsPerPage;
  const currentWallets = filteredWallets.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredWallets.length / walletsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header with Refresh and Export */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Wallet Management</h1>
              <p className="text-blue-100">Monitor and manage all user wallets</p>
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
                onClick={() => setShowExportModal(true)}
                className="px-6 py-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Total Balance</p>
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{(stats.totalBalance / 100000).toFixed(2)}L
            </p>
            <p className="text-xs text-gray-500 mt-2">Across {stats.totalWallets} wallets</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Average Balance</p>
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              ₹{stats.avgBalance.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-2">Per wallet</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Active Wallets</p>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-3xl font-bold text-white">{stats.activeWallets}</p>
            <p className="text-xs text-gray-500 mt-2">With balance {'>'} ₹1000</p>
          </div>

          <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700 hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-400">Highest Balance</p>
              <DollarSign className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">₹{stats.highestBalance.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-2">{stats.highestBalanceUser}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 text-white placeholder-gray-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl hover:bg-gray-700 transition flex items-center gap-2 text-gray-300"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                >
                  <option value="all">All Wallets</option>
                  <option value="high">High Balance (&gt;10k)</option>
                  <option value="active">Active (1k-10k)</option>
                  <option value="low">Low Balance (≤1k)</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Wallets Table */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Wallet Balance</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Transactions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Last Active</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentWallets.map((wallet) => (
                  <tr key={wallet._id} className="hover:bg-gray-700/50 transition group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {wallet.userName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          {wallet.isFrozen && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-700 rounded-full flex items-center justify-center border-2 border-gray-800">
                              <Ban className="w-2 h-2 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{wallet.userName}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {wallet.userEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-semibold text-blue-400">
                        ₹{wallet.balance.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-300">{wallet.transactionCount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        {wallet.lastActive}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(wallet.balance, wallet.isFrozen)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(wallet)}
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
                Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredWallets.length)} of {filteredWallets.length} wallets
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Export Data</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <button
                onClick={exportAsCSV}
                disabled={exporting}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-green-900/30 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">CSV File</h3>
                  <p className="text-sm text-gray-400">Export as spreadsheet</p>
                </div>
                {exporting && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              </button>

              <button
                onClick={exportAsJSON}
                disabled={exporting}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-yellow-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">JSON File</h3>
                  <p className="text-sm text-gray-400">Export as structured data</p>
                </div>
                {exporting && <Loader2 className="w-5 h-5 animate-spin text-gray-400" />}
              </button>

              <button
                onClick={printReport}
                disabled={exporting}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-purple-900/30 rounded-xl">
                  <Printer className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Print Report</h3>
                  <p className="text-sm text-gray-400">Generate printable report</p>
                </div>
              </button>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <p className="text-sm text-gray-400 text-center">
                Exporting {filteredWallets.length} wallets
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Details Modal */}
      {showDetailsModal && selectedWallet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Wallet Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-xl">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                  {selectedWallet.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedWallet.userName}</h3>
                  <p className="text-gray-400">{selectedWallet.userEmail}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Balance</p>
                  <p className="text-2xl font-bold text-blue-400">₹{selectedWallet.balance.toFixed(2)}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Status</p>
                  <div className="mt-2">
                    {getStatusBadge(selectedWallet.balance, selectedWallet.isFrozen)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Transactions</p>
                  <p className="text-xl font-bold text-white">{selectedWallet.transactionCount}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-xs text-gray-400">Last Active</p>
                  <p className="text-sm text-white">{selectedWallet.lastActive}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}