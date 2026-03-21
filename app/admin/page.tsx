'use client';

import { useState } from 'react';
import { 
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  X,
  Calendar,
  Filter,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('transactions');
  const [dateRange, setDateRange] = useState('month');
  const [generating, setGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  // ============================================
  // GENERATE REPORT FUNCTION
  // ============================================
  const handleGenerateReport = () => {
    setGenerating(true);
    
    // Show generating message
    toast.info('Generating report...', {
      description: 'Please wait while we prepare your report'
    });
    
    // Simulate report generation (2 seconds)
    setTimeout(() => {
      setGenerating(false);
      setShowGenerateModal(false);
      
      // Show success message
      toast.success('Report generated successfully!', {
        description: `Your ${reportType} report for ${dateRange} is ready`
      });
      
      // Open export modal
      setShowExportModal(true);
    }, 2000);
  };

  // ============================================
  // EXPORT FUNCTIONS
  // ============================================
  
  const exportAsCSV = () => {
    toast.success('CSV download started', {
      description: 'Your report is being generated...'
    });
    
    // Generate sample CSV data
    setTimeout(() => {
      const headers = 'Date,Transaction ID,User,Stock,Type,Quantity,Price,Total\n';
      const rows = [];
      
      for (let i = 1; i <= 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        rows.push(
          `${date.toLocaleDateString()},TXN00${i},user${i},${i % 2 === 0 ? 'AAPL' : 'MSFT'},${i % 2 === 0 ? 'BUY' : 'SELL'},${Math.floor(Math.random() * 10) + 1},${(Math.random() * 200 + 100).toFixed(2)},${(Math.random() * 2000 + 500).toFixed(2)}`
        );
      }
      
      const csv = headers + rows.join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      
      toast.success('CSV downloaded successfully');
      setShowExportModal(false);
    }, 1000);
  };

  const exportAsPDF = () => {
    toast.success('PDF generation started', {
      description: 'Your PDF report is being created...'
    });
    
    setTimeout(() => {
      // Create a simple HTML report and open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(generateReportHTML());
        printWindow.document.close();
        printWindow.print();
      }
      
      toast.success('PDF report ready');
      setShowExportModal(false);
    }, 1500);
  };

  const exportAsJSON = () => {
    toast.success('JSON export started');
    
    setTimeout(() => {
      const data = {
        reportType,
        dateRange,
        generatedAt: new Date().toISOString(),
        summary: {
          totalTransactions: 156,
          totalRevenue: 2456789.50,
          averageTransaction: 15748.65,
          topStocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
        },
        transactions: Array(20).fill(0).map((_, i) => ({
          id: `TXN00${i}`,
          date: new Date(Date.now() - i * 86400000).toISOString(),
          user: `user${i}`,
          stock: i % 2 === 0 ? 'AAPL' : 'MSFT',
          type: i % 2 === 0 ? 'BUY' : 'SELL',
          quantity: Math.floor(Math.random() * 10) + 1,
          price: Math.random() * 200 + 100,
          total: Math.random() * 2000 + 500
        }))
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast.success('JSON downloaded successfully');
      setShowExportModal(false);
    }, 1000);
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
    const reportTitle = reportType === 'transactions' ? 'Transaction Report' : 
                       reportType === 'users' ? 'User Activity Report' : 
                       reportType === 'stocks' ? 'Stock Performance Report' : 
                       'Financial Summary Report';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: #fff; 
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 { 
            color: #2563eb; 
            border-bottom: 2px solid #2563eb;
            padding-bottom: 10px;
          }
          h2 { 
            color: #4b5563; 
            margin-top: 30px; 
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
          }
          .date {
            color: #6b7280;
            font-size: 14px;
          }
          .summary {
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
            margin: 30px 0; 
          }
          .summary-card { 
            background: #f3f4f6; 
            padding: 20px; 
            border-radius: 8px; 
            border-left: 4px solid #2563eb; 
          }
          .summary-label { 
            font-size: 14px; 
            color: #6b7280; 
            margin-bottom: 5px; 
          }
          .summary-value { 
            font-size: 24px; 
            font-weight: bold; 
            color: #111827; 
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          th { 
            background: #2563eb; 
            color: white; 
            padding: 12px; 
            text-align: left; 
            font-size: 14px;
          }
          td { 
            padding: 12px; 
            border-bottom: 1px solid #e5e7eb; 
            color: #374151; 
          }
          tr:nth-child(even) { 
            background: #f9fafb; 
          }
          .buy { color: #10b981; font-weight: 600; }
          .sell { color: #ef4444; font-weight: 600; }
          .footer { 
            margin-top: 50px; 
            color: #6b7280; 
            text-align: center; 
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportTitle}</h1>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>
        
        <p><strong>Report Period:</strong> ${dateRange === 'day' ? 'Last 24 Hours' : 
                                           dateRange === 'week' ? 'Last 7 Days' : 
                                           dateRange === 'month' ? 'Last 30 Days' : 
                                           dateRange === 'quarter' ? 'Last 90 Days' : 'All Time'}</p>
        
        <div class="summary">
          <div class="summary-card">
            <div class="summary-label">Total Transactions</div>
            <div class="summary-value">156</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Total Revenue</div>
            <div class="summary-value">₹24.56L</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Active Users</div>
            <div class="summary-value">42</div>
          </div>
          <div class="summary-card">
            <div class="summary-label">Avg Transaction</div>
            <div class="summary-value">₹15,748</div>
          </div>
        </div>
        
        <h2>Transaction Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction ID</th>
              <th>User</th>
              <th>Stock</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${Array(10).fill(0).map((_, i) => {
              const type = i % 2 === 0 ? 'BUY' : 'SELL';
              return `
                <tr>
                  <td>${new Date(Date.now() - i * 86400000).toLocaleDateString()}</td>
                  <td>TXN00${i}</td>
                  <td>user${i}</td>
                  <td>${i % 2 === 0 ? 'AAPL' : 'MSFT'}</td>
                  <td class="${type === 'BUY' ? 'buy' : 'sell'}">${type}</td>
                  <td>${Math.floor(Math.random() * 10) + 1}</td>
                  <td>₹${(Math.random() * 200 + 100).toFixed(2)}</td>
                  <td>₹${(Math.random() * 2000 + 500).toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>© Stock Market App - Confidential Report</p>
          <p>This report is automatically generated and contains confidential information.</p>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Reports</h1>
          <p className="text-gray-400">Generate and download custom reports</p>
        </div>

        {/* Report Generator Card */}
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700 overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Generate New Report</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Report Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Report Type
                </label>
                <div className="relative">
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                  >
                    <option value="transactions">Transaction Report</option>
                    <option value="users">User Activity Report</option>
                    <option value="stocks">Stock Performance Report</option>
                    <option value="financial">Financial Summary Report</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date Range Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Date Range
                </label>
                <div className="relative">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600 text-white"
                  >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="quarter">Last 90 Days</option>
                    <option value="year">Last Year</option>
                    <option value="all">All Time</option>
                  </select>
                  <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={() => setShowGenerateModal(true)}
              disabled={generating}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Generate Report
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Report will include all transactions and analytics for the selected period
            </p>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <FileText className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Monthly Report</h3>
            <p className="text-sm text-gray-400 mb-4">March 2026</p>
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
              Download
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <FileSpreadsheet className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Quarterly Report</h3>
            <p className="text-sm text-gray-400 mb-4">Q1 2026</p>
            <button className="text-green-400 hover:text-green-300 text-sm font-medium flex items-center gap-1">
              Download
              <Download className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <Printer className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Yearly Summary</h3>
            <p className="text-sm text-gray-400 mb-4">2025</p>
            <button className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1">
              Download
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Generate Report Confirmation Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Generate Report</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-xl">
                <p className="text-sm text-gray-400 mb-3">Report Details:</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Type:</span>
                    <span className="text-white font-medium">
                      {reportType === 'transactions' ? 'Transaction Report' : 
                       reportType === 'users' ? 'User Activity Report' : 
                       reportType === 'stocks' ? 'Stock Performance Report' : 
                       'Financial Summary Report'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Period:</span>
                    <span className="text-white font-medium">
                      {dateRange === 'day' ? 'Last 24 Hours' : 
                       dateRange === 'week' ? 'Last 7 Days' : 
                       dateRange === 'month' ? 'Last 30 Days' : 
                       dateRange === 'quarter' ? 'Last 90 Days' : 
                       dateRange === 'year' ? 'Last Year' : 'All Time'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-300">
                This will generate a comprehensive report based on your selected criteria. 
                The report may take a few moments to prepare.
              </p>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 py-3 border border-gray-700 rounded-xl hover:bg-gray-700 transition font-medium text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Export Report</h2>
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
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-green-900/30 rounded-xl">
                  <FileSpreadsheet className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">CSV File</h3>
                  <p className="text-sm text-gray-400">Export as spreadsheet</p>
                </div>
              </button>

              <button
                onClick={exportAsJSON}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-yellow-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">JSON File</h3>
                  <p className="text-sm text-gray-400">Export as structured data</p>
                </div>
              </button>

              <button
                onClick={exportAsPDF}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-red-900/30 rounded-xl">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">PDF Report</h3>
                  <p className="text-sm text-gray-400">Download formatted report</p>
                </div>
              </button>

              <button
                onClick={printReport}
                className="w-full p-4 bg-gray-900/50 rounded-xl hover:bg-gray-700 transition flex items-center gap-4 group"
              >
                <div className="p-3 bg-purple-900/30 rounded-xl">
                  <Printer className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-white">Print Report</h3>
                  <p className="text-sm text-gray-400">Open print dialog</p>
                </div>
              </button>
            </div>

            <div className="p-6 border-t border-gray-700 bg-gray-900/50 rounded-b-2xl">
              <p className="text-sm text-gray-400 text-center">
                Your report is ready for download
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}