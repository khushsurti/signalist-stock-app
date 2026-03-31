'use client';

import { startTransition, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, PieChart, RefreshCw } from 'lucide-react';
import { PortfolioHoldingsTable } from '@/components/portfolio/PortfolioHoldingsTable';
import { PortfolioSummaryCards } from '@/components/portfolio/PortfolioSummaryCards';
import type { PortfolioResponse } from '@/types/portfolio';

interface PortfolioClientProps {
  initialPortfolio: PortfolioResponse;
}

const REFRESH_INTERVAL_MS = 15000;

function LoadingShell() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="h-48 animate-pulse rounded-3xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-3xl border border-white/10 bg-white/5" />
    </div>
  );
}

export default function PortfolioClient({ initialPortfolio }: PortfolioClientProps) {
  const [portfolio, setPortfolio] = useState<PortfolioResponse>(initialPortfolio);
  const [isLoading, setIsLoading] = useState(!initialPortfolio.updatedAt);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPortfolio = useCallback(async (backgroundRefresh = false) => {
    if (backgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch('/api/portfolio', { cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load portfolio.');
      }

      setError(null);
      startTransition(() => {
        setPortfolio(data as PortfolioResponse);
      });
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Failed to load portfolio.';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void fetchPortfolio(true);
    }, REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [fetchPortfolio]);

  if (isLoading) {
    return <LoadingShell />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white">My Portfolio</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">
            Live holdings, wallet cash, and profit/loss synced from your MongoDB portfolio with fresh market prices.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Updated {new Date(portfolio.updatedAt).toLocaleTimeString()}</span>
          <button
            type="button"
            onClick={() => void fetchPortfolio(true)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10"
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start justify-between gap-4 rounded-3xl border border-rose-500/30 bg-rose-500/10 p-5 text-rose-100">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-300" />
            <div>
              <p className="font-medium">Portfolio refresh failed</p>
              <p className="mt-1 text-sm text-rose-100/80">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchPortfolio(false)}
            className="rounded-full border border-rose-300/30 px-4 py-2 text-sm font-medium transition hover:bg-rose-400/10"
          >
            Retry
          </button>
        </div>
      ) : null}

      <PortfolioSummaryCards portfolio={portfolio} />

      {portfolio.holdings.length === 0 ? (
        <div className="rounded-[2rem] border border-white/10 bg-white/5 p-10 text-center shadow-[0_20px_80px_-40px_rgba(15,23,42,0.95)]">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
            <PieChart className="h-10 w-10 text-white/35" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold text-white">No holdings yet</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-white/60">
            Your portfolio becomes live here as soon as you complete your first stock purchase.
          </p>
          <Link
            href="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-500 px-5 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Browse Stocks
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Your Holdings</h2>
              <p className="mt-1 text-sm text-white/55">
                Columns are aligned for company, shares, average cost, live price, profit/loss, and market value.
              </p>
            </div>
            <p className="text-sm text-white/45">{portfolio.holdingsCount} positions</p>
          </div>
          <PortfolioHoldingsTable holdings={portfolio.holdings} />
        </section>
      )}
    </div>
  );
}
