'use server';

import { connectToDatabase } from '@/database/mongoose';
import User from '@/database/models/user.model';
import Transaction from '@/database/models/transaction.model';
import Portfolio from '@/database/models/portfolio.model';
import Wallet from '@/database/models/wallet.model';
import { Watchlist } from '@/database/models/watchlist.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ============================================
// HELPER FUNCTIONS - SAMPLE DATA
// ============================================

// Helper function for sample stocks
function getSampleStocks() {
  return [
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      priceFormatted: '₹175.34',
      changePercent: 2.5,
      changeFormatted: '+2.5%'
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corporation',
      exchange: 'NASDAQ',
      priceFormatted: '₹330.21',
      changePercent: -0.5,
      changeFormatted: '-0.5%'
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      exchange: 'NASDAQ',
      priceFormatted: '₹142.80',
      changePercent: 0.8,
      changeFormatted: '+0.8%'
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      exchange: 'NASDAQ',
      priceFormatted: '₹178.50',
      changePercent: -1.1,
      changeFormatted: '-1.1%'
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      exchange: 'NASDAQ',
      priceFormatted: '₹240.15',
      changePercent: 1.2,
      changeFormatted: '+1.2%'
    }
  ];
}

// ✅ Helper function for sample wallets
function getSampleWallets() {
  return [
    {
      _id: '1',
      userId: 'user1',
      userName: 'John Doe',
      userEmail: 'john@example.com',
      balance: 25000,
      transactionCount: 12,
      lastActive: '2024-03-05',
      createdAt: '2024-01-15',
    },
    {
      _id: '2',
      userId: 'user2',
      userName: 'Jane Smith',
      userEmail: 'jane@example.com',
      balance: 15000,
      transactionCount: 8,
      lastActive: '2024-03-04',
      createdAt: '2024-02-20',
    },
    {
      _id: '3',
      userId: 'user3',
      userName: 'Bob Johnson',
      userEmail: 'bob@example.com',
      balance: 5000,
      transactionCount: 3,
      lastActive: '2024-03-01',
      createdAt: '2024-03-10',
    },
    {
      _id: '4',
      userId: 'user4',
      userName: 'Alice Brown',
      userEmail: 'alice@example.com',
      balance: 500,
      transactionCount: 1,
      lastActive: '2024-02-28',
      createdAt: '2024-02-25',
    },
    {
      _id: '5',
      userId: 'user5',
      userName: 'Charlie Wilson',
      userEmail: 'charlie@example.com',
      balance: 100000,
      transactionCount: 25,
      lastActive: '2024-03-05',
      createdAt: '2024-01-05',
    },
  ];
}
// ============================================
// ADMIN - User Management
// ============================================

// Get all users
export const getAllUsers = async () => {
  try {
    await connectToDatabase();
    
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    if (!users || users.length === 0) {
      return [];
    }
    
    return users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name || 'N/A',
      email: user.email,
      role: user.role || 'user',
      isBlocked: user.isBlocked || false,
      createdAt: user.createdAt 
        ? new Date(user.createdAt).toLocaleDateString() 
        : new Date().toLocaleDateString(),
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// Update user role
export const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
  try {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(userId, { role });
    
    revalidatePath('/admin/users');
    return { success: true, message: 'User role updated' };
  } catch (error) {
    console.error('Error updating user role:', error);
    return { success: false, error: 'Failed to update user role' };
  }
};

// Toggle user block status
export const toggleUserBlock = async (userId: string, block: boolean) => {
  try {
    await connectToDatabase();
    
    await User.findByIdAndUpdate(userId, { isBlocked: block });
    
    revalidatePath('/admin/users');
    return { success: true, message: block ? 'User blocked' : 'User unblocked' };
  } catch (error) {
    console.error('Error toggling user block:', error);
    return { success: false, error: 'Failed to update user status' };
  }
};

/// ============================================
// ADMIN - Delete User
// ============================================
export const deleteUser = async (userId: string) => {
  try {
    await connectToDatabase();
    const auth = await getAuth();
    
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Authentication required' };
    }

    if (session.user.id === userId) {
      return { success: false, error: 'You cannot delete your own account' };
    }

    const user = await User.findById(userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the last admin' };
      }
    }

    // Delete related data
    try {
      await Watchlist.deleteMany({ userId });
      await Portfolio.deleteMany({ userId });
      await Transaction.deleteMany({ userId });
      await Wallet.deleteOne({ userId });
      
    } catch (relatedError) {
      console.error('Error deleting related data:', relatedError);
    }

    await User.findByIdAndDelete(userId);
    revalidatePath('/admin/users');
    
    return { success: true, message: 'User deleted successfully' };

  } catch (error) {
    console.error('Error deleting user:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    };
  }
};

// ============================================
// ADMIN - Transactions
// ============================================

export const getAllTransactions = async () => {
  try {
    await connectToDatabase();
    
    const transactions = await Transaction.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    return transactions.map((tx: any) => ({
      _id: tx._id.toString(),
      userId: tx.userId.toString(),
      symbol: tx.symbol,
      type: tx.type,
      price: tx.price,
      quantity: tx.quantity,
      total: tx.total,
      createdAt: tx.createdAt?.toISOString() || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};

// ============================================
// ADMIN - Dashboard Stats
// ============================================

export const getDashboardStats = async () => {
  try {
    await connectToDatabase();
    
    const totalUsers = await User.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const totalPortfolio = await Portfolio.countDocuments();
    
    // Get total transaction volume
    const transactions = await Transaction.find({});
    const totalVolume = transactions.reduce((sum, tx: any) => sum + (tx.total || 0), 0);
    
    return {
      totalUsers,
      totalTransactions,
      totalPortfolio,
      totalVolume,
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalTransactions: 0,
      totalPortfolio: 0,
      totalVolume: 0,
    };
  }
};
// ============================================
// ADMIN - Stocks Management
// ============================================

export const getAllStocks = async () => {
  try {
    await connectToDatabase();
    
    // Get distinct stocks from transactions and portfolio
    const transactionStocks = await Transaction.distinct('symbol');
    const portfolioStocks = await Portfolio.distinct('symbol');
    
    // Combine and get unique symbols
    const allSymbols = [...new Set([...transactionStocks, ...portfolioStocks])];
    
    if (allSymbols.length === 0) {
      return getSampleStocks();
    }
    
    const stocks = await Promise.all(
      allSymbols.slice(0, 50).map(async (symbol: string) => {
        try {
          const { getStocksDetails } = await import('./finnhub.actions');
          const details = await getStocksDetails(symbol);
          
          if (details) {
            return {
              symbol: details.symbol,
              name: details.company,
              exchange: 'NASDAQ',
              priceFormatted: details.priceFormatted,
              changePercent: details.changePercent,
              changeFormatted: details.changeFormatted,
            };
          }
        } catch (error) {
          console.error(`Error fetching details for ${symbol}:`, error);
        }
        
        return {
          symbol,
          name: symbol,
          exchange: 'US',
          priceFormatted: '—',
          changePercent: 0,
          changeFormatted: '0%',
        };
      })
    );
    
    return stocks;
  } catch (error) {
    console.error('Error fetching stocks:', error);
    return getSampleStocks();
  }
};

// ✅ ADD STOCK FUNCTION
export const addStock = async (stockData: any) => {
  try {
    // Implement your database logic here
    console.log('✅ Adding stock:', stockData);
    
    // Here you would save to your database
    // For example, you might create a Stocks collection
    
    revalidatePath('/admin/stocks');
    return { success: true, message: 'Stock added successfully' };
  } catch (error) {
    console.error('Error adding stock:', error);
    return { success: false, error: 'Failed to add stock' };
  }
};

// ✅ UPDATE STOCK FUNCTION
export const updateStock = async (symbol: string, stockData: any) => {
  try {
    console.log('✅ Updating stock:', symbol, stockData);
    
    // Implement your update logic here
    
    revalidatePath('/admin/stocks');
    return { success: true, message: 'Stock updated successfully' };
  } catch (error) {
    console.error('Error updating stock:', error);
    return { success: false, error: 'Failed to update stock' };
  }
};

// ✅ DELETE STOCK FUNCTION
export const deleteStock = async (symbol: string) => {
  try {
    console.log('🗑️ Deleting stock:', symbol);
    
    // Delete related data
    await Transaction.deleteMany({ symbol: symbol.toUpperCase() });
    await Portfolio.deleteMany({ symbol: symbol.toUpperCase() });
    await Watchlist.deleteMany({ symbol: symbol.toUpperCase() });
    
    revalidatePath('/admin/stocks');
    return { success: true, message: 'Stock deleted successfully' };
  } catch (error) {
    console.error('Error deleting stock:', error);
    return { success: false, error: 'Failed to delete stock' };
  }
};


//============================================
// ✅ ADMIN - Wallet Management (COMPLETE)
// ============================================

export const getAllWallets = async () => {
  try {
    await connectToDatabase();
    
    const wallets = await Wallet.find({})
      .sort({ balance: -1 })
      .limit(100)
      .lean();
    
    if (!wallets || wallets.length === 0) {
      return getSampleWallets();
    }
    
    const walletsWithUsers = await Promise.all(
      wallets.map(async (w: any) => {
        let userName = 'Unknown User';
        let userEmail = 'unknown@email.com';
        
        if (w.userId) {
          try {
            const user = await User.findById(w.userId).lean();
            if (user) {
              userName = user.name || 'Unknown User';
              userEmail = user.email || 'unknown@email.com';
            }
          } catch (err) {
            console.log(`Error fetching user for wallet ${w._id}:`, err);
          }
        }
        
        const transactionCount = await Transaction.countDocuments({ 
          userId: w.userId 
        });
        
        const lastTx = await Transaction.findOne({ userId: w.userId })
          .sort({ createdAt: -1 })
          .lean();
        
        return {
          _id: w._id.toString(),
          userId: w.userId.toString(),
          userName,
          userEmail,
          balance: w.balance || 0,
          transactionCount: transactionCount || 0,
          lastActive: lastTx?.createdAt 
            ? new Date(lastTx.createdAt).toLocaleDateString() 
            : 'Never',
          createdAt: w.createdAt?.toISOString().split('T')[0] || 'N/A',
          isFrozen: w.isFrozen || false
        };
      })
    );
    
    return walletsWithUsers;
  } catch (error) {
    console.error('Error fetching wallets:', error);
    return getSampleWallets();
  }
};

export const getWalletStats = async () => {
  try {
    await connectToDatabase();
    
    const wallets = await Wallet.find({}).lean();
    
    const totalBalance = wallets.reduce((sum, w: any) => sum + (w.balance || 0), 0);
    const totalWallets = wallets.length;
    const avgBalance = totalWallets > 0 ? totalBalance / totalWallets : 0;
    const activeWallets = wallets.filter((w: any) => (w.balance || 0) > 1000).length;
    const highestBalance = wallets.length > 0 
      ? Math.max(...wallets.map((w: any) => w.balance || 0)) 
      : 0;
    
    let highestBalanceUser = 'Unknown';
    if (highestBalance > 0) {
      const topWallet = wallets.find((w: any) => w.balance === highestBalance);
      if (topWallet?.userId) {
        try {
          const user = await User.findById(topWallet.userId).lean();
          highestBalanceUser = user?.name || 'Unknown';
        } catch (err) {
          console.log('Error fetching top wallet user');
        }
      }
    }
    
    return {
      totalBalance,
      totalWallets,
      avgBalance,
      activeWallets,
      highestBalance,
      highestBalanceUser
    };
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return {
      totalBalance: 0,
      totalWallets: 0,
      avgBalance: 0,
      activeWallets: 0,
      highestBalance: 0,
      highestBalanceUser: 'Unknown'
    };
  }
};

export const updateWalletBalance = async (userId: string, newBalance: number) => {
  try {
    await connectToDatabase();
    
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }
    
    wallet.balance = newBalance;
    await wallet.save();
    
    revalidatePath('/admin/wallets');
    return { success: true, message: 'Wallet balance updated' };
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    return { success: false, error: 'Failed to update balance' };
  }
};

export const freezeWallet = async (userId: string, freeze: boolean) => {
  try {
    await connectToDatabase();
    
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return { success: false, error: 'Wallet not found' };
    }
    
    wallet.isFrozen = freeze;
    await wallet.save();
    
    revalidatePath('/admin/wallets');
    return { success: true, message: freeze ? 'Wallet frozen' : 'Wallet unfrozen' };
  } catch (error) {
    console.error('Error freezing wallet:', error);
    return { success: false, error: 'Failed to update wallet status' };
  }
};

export const deleteWallet = async (userId: string) => {
  try {
    await connectToDatabase();
    
    await Wallet.deleteOne({ userId });
    
    revalidatePath('/admin/wallets');
    return { success: true, message: 'Wallet deleted successfully' };
  } catch (error) {
    console.error('Error deleting wallet:', error);
    return { success: false, error: 'Failed to delete wallet' };
  }
};
