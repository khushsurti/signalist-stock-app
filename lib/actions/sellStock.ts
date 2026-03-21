'use server';

import { connectToDatabase } from '@/database/mongoose';
// ✅ Relative paths use karo
import Portfolio from '../../database/models/portfolio.model';
import Wallet from '../../database/models/wallet.model';
import Transaction from '../../database/models/transaction.model';

export const sellStock = async (
  userId: string,
  symbol: string,
  price: number,
  quantity: number
) => {
  try {
    await connectToDatabase();

    const portfolio = await Portfolio.findOne({ userId, symbol });

    if (!portfolio || portfolio.quantity < quantity) {
      return { success: false, error: 'Not enough stocks to sell' };
    }

    const totalValue = price * quantity;

    // Update portfolio
    portfolio.quantity -= quantity;
    if (portfolio.quantity === 0) {
      await Portfolio.deleteOne({ _id: portfolio._id });
    } else {
      await portfolio.save();
    }

    // Add to wallet
    const wallet = await Wallet.findOne({ userId });
    if (wallet) {
      wallet.balance += totalValue;
      await wallet.save();
    }

    // Save transaction
    await Transaction.create({
      userId, symbol, type: 'SELL', price, quantity, total: totalValue
    });

    return { success: true, message: 'Stock sold successfully' };
  } catch (error) {
    console.error('Error selling stock:', error);
    return { success: false, error: 'Failed to sell stock' };
  }
};