'use server';

import { connectToDatabase } from '@/database/mongoose';
import Portfolio from '../../database/models/portfolio.model';
import Wallet from '../../database/models/wallet.model';
import Transaction from '../../database/models/transaction.model';

export const buyStock = async (
  userId: string,
  symbol: string,
  company: string,
  price: number,
  quantity: number
) => {
  try {
    await connectToDatabase();

    const totalCost = price * quantity;

    // Check wallet
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 100000 });
    }

    if (wallet.balance < totalCost) {
      return { success: false, error: 'Insufficient Balance' };
    }

    // Deduct from wallet
    wallet.balance -= totalCost;
    await wallet.save();

    // Update portfolio
    let portfolio = await Portfolio.findOne({ userId, symbol });

    if (portfolio) {
      const totalQty = portfolio.quantity + quantity;
      portfolio.avgPrice = 
        (portfolio.avgPrice * portfolio.quantity + price * quantity) / totalQty;
      portfolio.quantity = totalQty;
      await portfolio.save();
    } else {
      await Portfolio.create({ userId, symbol, company, quantity, avgPrice: price });
    }

    // Save transaction
    await Transaction.create({
      userId, symbol, type: 'BUY', price, quantity, total: totalCost
    });

    return { success: true, message: 'Stock bought successfully' };
  } catch (error) {
    console.error('Error buying stock:', error);
    return { success: false, error: 'Failed to buy stock' };
  }
};