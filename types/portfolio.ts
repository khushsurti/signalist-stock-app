export interface PortfolioHolding {
  stockSymbol: string;
  companyName: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  investedAmount: number;
  marketValue: number;
  profitLoss: number;
  profitLossPercent: number;
  allocationPercent: number;
  lastUpdated: string;
}

export interface PortfolioSummary {
  cashBalance: number;
  investedAmount: number;
  totalMarketValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalNetWorth: number;
}

export interface PortfolioResponse extends PortfolioSummary {
  holdings: PortfolioHolding[];
  holdingsCount: number;
  updatedAt: string;
}
