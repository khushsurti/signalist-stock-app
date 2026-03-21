'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { revalidatePath } from 'next/cache';
import { auth } from '../better-auth/auth';
import { headers } from 'next/headers';
import { getStocksDetails } from './finnhub.actions';

// ============================================
// GET WATCHLIST SYMBOLS BY EMAIL
// ============================================
export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

// ============================================
// ADD STOCK TO WATCHLIST
// ============================================
export const addToWatchlist = async (symbol: string, company: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      return { success: false, error: 'Please sign in to add to watchlist' };
    }

    await connectToDatabase();

    // Check if stock already exists in watchlist
    const existingItem = await Watchlist.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });

    if (existingItem) {
      return { success: false, error: 'Stock already in watchlist' };
    }

    // Add to watchlist
    const newItem = new Watchlist({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company.trim(),
    });

    await newItem.save();
    revalidatePath('/watchlist');

    return { success: true, message: 'Stock added to watchlist' };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, error: 'Failed to add stock to watchlist' };
  }
};

// ============================================
// REMOVE STOCK FROM WATCHLIST
// ============================================
export const removeFromWatchlist = async (symbol: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      return { success: false, error: 'Please sign in to remove from watchlist' };
    }

    await connectToDatabase();

    // Remove from watchlist
    await Watchlist.deleteOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
    });
    revalidatePath('/watchlist');

    return { success: true, message: 'Stock removed from watchlist' };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, error: 'Failed to remove stock from watchlist' };
  }
};

// ============================================
// GET USER'S WATCHLIST (BASIC)
// ============================================
export const getUserWatchlist = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      console.log('⚠️ getUserWatchlist: No authenticated user');
      return [];
    }

    await connectToDatabase();

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    // Safely convert MongoDB documents
    return watchlist.map((item: any) => ({
      _id: item._id.toString(),
      userId: item.userId.toString(),
      symbol: item.symbol,
      company: item.company,
      addedAt: item.addedAt,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));
    
  } catch (error) {
    console.error('❌ Error in getUserWatchlist:', error);
    return [];
  }
};

// ============================================
// ✅ SOLUTION 3: GET WATCHLIST WITH STOCK DATA (UPDATED)
// ============================================
export const getWatchlistWithData = async () => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user) {
      console.log('⚠️ getWatchlistWithData: No authenticated user');
      return [];
    }

    await connectToDatabase();

    const watchlist = await Watchlist.find({ userId: session.user.id })
      .sort({ addedAt: -1 })
      .lean();

    if (watchlist.length === 0) return [];

    // Import dynamically
    const { getStocksDetails } = await import('./finnhub.actions');

    const stocksWithData = await Promise.all(
      watchlist.map(async (item: any) => {
        try {
          // ✅ Handle API errors gracefully - अगर API fail हो तो भी app crash न हो
          let stockData = null;
          try {
            stockData = await getStocksDetails(item.symbol);
          } catch (apiError) {
            console.log(`⚠️ API error for ${item.symbol}, using fallback data`);
          }
          
          if (!stockData) {
            return {
              company: item.company,
              symbol: item.symbol,
              currentPrice: 0,
              priceFormatted: '—',
              changeFormatted: '—',
              changePercent: 0,
              marketCap: '—',
              peRatio: '—',
            };
          }

          return {
            company: stockData.company,
            symbol: stockData.symbol,
            currentPrice: stockData.currentPrice,
            priceFormatted: stockData.priceFormatted,
            changeFormatted: stockData.changeFormatted,
            changePercent: stockData.changePercent,
            marketCap: stockData.marketCapFormatted || '—',
            peRatio: stockData.peRatio || '—',
          };
        } catch (error) {
          console.error(`Error fetching data for ${item.symbol}:`, error);
          return {
            company: item.company,
            symbol: item.symbol,
            currentPrice: 0,
            priceFormatted: '—',
            changeFormatted: '—',
            changePercent: 0,
            marketCap: '—',
            peRatio: '—',
          };
        }
      })
    );

    return JSON.parse(JSON.stringify(stocksWithData));
  } catch (error) {
    console.error('❌ Error in getWatchlistWithData:', error);
    return [];
  }
};