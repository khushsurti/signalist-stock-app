'use server';

import { connectToDatabase } from '@/database/mongoose';
import Wallet from '@/database/models/wallet.model';

export const getWallet = async (userId: string) => {
  try {
    await connectToDatabase();
    
    let wallet = await Wallet.findOne({ userId }).lean();
    
    if (!wallet) {
      const newWallet = await Wallet.create({ userId, balance: 100000 });
      wallet = newWallet.toObject();
    }

    // ✅ Type assertion - TypeScript ko batao ki wallet exist karta hai
    const walletData = wallet as any;
    
    return {
      ...walletData,
      _id: walletData._id.toString(),
      userId: walletData.userId.toString()
    };
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return { balance: 100000 };
  }
};