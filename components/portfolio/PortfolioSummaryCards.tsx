'use client';

import { BarChart3, DollarSign, TrendingUp } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { PortfolioResponse } from '@/types/portfolio';

interface PortfolioSummaryCardsProps {
  portfolio: PortfolioResponse;
}

function SummaryTrend({ value, label }: { value: number; label: string }) {
  const isPositive = value >= 0;

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className={cn('text-sm font-medium', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
        {isPositive ? '+' : '-'}{formatPrice(Math.abs(value))}
      </span>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-xs font-medium',
          isPositive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
        )}
      >
        {label}
      </span>
    </div>
  );
}

export function PortfolioSummaryCards({ portfolio }: PortfolioSummaryCardsProps) {
  const investedAllocation = portfolio.totalNetWorth > 0
    ? (portfolio.investedAmount / portfolio.totalNetWorth) * 100
    : 0;
  const liveAllocation = portfolio.totalNetWorth > 0
    ? (portfolio.totalMarketValue / portfolio.totalNetWorth) * 100
    : 0;

  const cards = [
    {
      title: 'Real-Time Investment',
      eyebrow: 'Live Portfolio',
      value: formatPrice(portfolio.totalMarketValue),
      helper: 'Live value of your current holdings',
      meta: `${liveAllocation.toFixed(1)}% of total net worth`,
      icon: TrendingUp,
      iconClassName: 'bg-sky-500/15 text-sky-300',
      trendValue: portfolio.totalProfitLoss,
      trendLabel: 'Live P/L',
    },
    {
      title: 'Invested Capital',
      eyebrow: 'Cost Basis',
      value: formatPrice(portfolio.investedAmount),
      helper: `Across ${portfolio.holdingsCount} active holdings`,
      meta: `${investedAllocation.toFixed(1)}% deployed in market`,
      icon: DollarSign,
      iconClassName: 'bg-fuchsia-500/15 text-fuchsia-300',
    },
    {
      title: 'Market Value',
      eyebrow: 'Live Valuation',
      value: formatPrice(portfolio.totalMarketValue),
      helper: `Net worth ${formatPrice(portfolio.totalNetWorth)}`,
      meta: `${portfolio.totalProfitLossPercent >= 0 ? '+' : ''}${portfolio.totalProfitLossPercent.toFixed(2)}% overall`,
      icon: BarChart3,
      iconClassName: 'bg-emerald-500/15 text-emerald-300',
      trendValue: portfolio.totalProfitLoss,
      trendLabel: `${portfolio.totalProfitLossPercent >= 0 ? '+' : ''}${portfolio.totalProfitLossPercent.toFixed(2)}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.95)] backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className={cn('rounded-2xl p-3', card.iconClassName)}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-xs uppercase tracking-[0.24em] text-white/45">{card.eyebrow}</span>
            </div>
            <div className="mt-8">
              <p className="text-sm text-white/65">{card.title}</p>
              <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
              {card.trendValue !== undefined ? (
                <SummaryTrend value={card.trendValue} label={card.trendLabel!} />
              ) : null}
              <p className="mt-4 text-sm text-white/70">{card.helper}</p>
              <p className="mt-2 text-xs text-white/45">{card.meta}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
