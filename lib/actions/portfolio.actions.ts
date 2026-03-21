'use server';

import { connectToDatabase } from '@/database/mongoose';
// ✅ Relative path use karo
import Portfolio from '../../database/models/portfolio.model';

export const getPortfolio = async (userId: string) => {
  try {
    await connectToDatabase();
    
    const portfolio = await Portfolio.find({ userId }).lean();
    
    // Convert MongoDB documents to plain objects
    return portfolio.map((item: any) => ({
      ...item,
      _id: item._id.toString(),
      userId: item.userId.toString()
    }));
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return [];
  }
};