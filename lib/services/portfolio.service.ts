import { connectToDatabase } from '@/database/mongoose';
import Portfolio from '@/database/models/portfolio.model';
import Wallet from '@/database/models/wallet.model';
import { fetchLiveStockSnapshot } from '@/lib/services/market-data';
import type { PortfolioHolding, PortfolioResponse } from '@/types/portfolio';

interface PortfolioDocument {
  symbol: string;
  company: string;
  quantity: number;
  avgPrice: number;
}

export async function getPortfolioSnapshot(userId: string): Promise<PortfolioResponse> {
  await connectToDatabase();

  const [wallet, portfolioDocuments] = await Promise.all([
    Wallet.findOne({ userId }).lean(),
    Portfolio.find({ userId }).sort({ updatedAt: -1 }).lean(),
  ]);

  const cashBalance = Number(((wallet as { balance?: number } | null)?.balance) || 0);
  const rawHoldings = portfolioDocuments as unknown as PortfolioDocument[];

  const holdingsWithMarketData = await Promise.all(
    rawHoldings.map(async (holding) => {
      const marketSnapshot = await fetchLiveStockSnapshot(holding.symbol);
      const shares = Number(holding.quantity || 0);
      const avgPrice = Number(holding.avgPrice || 0);
      const investedAmount = shares * avgPrice;
      const currentPrice = Number(marketSnapshot.currentPrice || avgPrice);
      const marketValue = shares * currentPrice;
      const profitLoss = marketValue - investedAmount;
      const profitLossPercent = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;

      return {
        stockSymbol: holding.symbol,
        companyName: holding.company || marketSnapshot.companyName,
        shares,
        avgPrice,
        currentPrice,
        investedAmount,
        marketValue,
        profitLoss,
        profitLossPercent,
        allocationPercent: 0,
        lastUpdated: new Date().toISOString(),
      } satisfies PortfolioHolding;
    })
  );

  const investedAmount = holdingsWithMarketData.reduce((sum, holding) => sum + holding.investedAmount, 0);
  const totalMarketValue = holdingsWithMarketData.reduce((sum, holding) => sum + holding.marketValue, 0);
  const totalProfitLoss = totalMarketValue - investedAmount;
  const totalProfitLossPercent = investedAmount > 0 ? (totalProfitLoss / investedAmount) * 100 : 0;
  const totalNetWorth = cashBalance + totalMarketValue;

  const holdings = holdingsWithMarketData.map((holding) => ({
    ...holding,
    allocationPercent: totalMarketValue > 0 ? (holding.marketValue / totalMarketValue) * 100 : 0,
  }));

  return {
    cashBalance,
    investedAmount,
    totalMarketValue,
    totalProfitLoss,
    totalProfitLossPercent,
    totalNetWorth,
    holdings,
    holdingsCount: holdings.length,
    updatedAt: new Date().toISOString(),
  };
}
