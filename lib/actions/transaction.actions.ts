'use server';

import { connectToDatabase } from '@/database/mongoose';
// ✅ Relative path use करो
import Transaction from '../../database/models/transaction.model';

export const getTransactions = async (userId: string) => {
  try {
    await connectToDatabase();
    
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
    
    return transactions.map((tx: any) => ({
      _id: tx._id?.toString() || '',
      userId: tx.userId?.toString() || '',
      symbol: tx.symbol || '',
      type: tx.type || '',
      price: tx.price || 0,
      quantity: tx.quantity || 0,
      total: tx.total || 0,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt
    }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
};