'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn, formatPrice } from '@/lib/utils';
import type { PortfolioHolding } from '@/types/portfolio';

interface PortfolioHoldingsTableProps {
  holdings: PortfolioHolding[];
}

function ProfitLossCell({ holding }: { holding: PortfolioHolding }) {
  const isProfit = holding.profitLoss >= 0;

  return (
    <div className={cn('text-right', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
      <p className="font-semibold">
        {isProfit ? '+' : '-'}{formatPrice(Math.abs(holding.profitLoss))}
      </p>
      <p className="text-xs">
        {isProfit ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
      </p>
    </div>
  );
}

export function PortfolioHoldingsTable({ holdings }: PortfolioHoldingsTableProps) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.95)] md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/10 hover:bg-transparent">
              <TableHead className="px-6 py-4 text-white/55">Company</TableHead>
              <TableHead className="px-4 py-4 text-right text-white/55">Shares</TableHead>
              <TableHead className="px-4 py-4 text-right text-white/55">Avg Price</TableHead>
              <TableHead className="px-4 py-4 text-right text-white/55">Current</TableHead>
              <TableHead className="px-4 py-4 text-right text-white/55">P/L</TableHead>
              <TableHead className="px-6 py-4 text-right text-white/55">Total Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => (
              <TableRow key={holding.stockSymbol} className="border-white/10 hover:bg-white/5">
                <TableCell className="px-6 py-5">
                  <Link href={`/stocks/${holding.stockSymbol}`} className="group flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-600 text-lg font-semibold text-white">
                      {holding.stockSymbol.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{holding.companyName}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-white/55">
                        <span>{holding.stockSymbol}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="px-4 py-5 text-right font-medium text-white">{holding.shares}</TableCell>
                <TableCell className="px-4 py-5 text-right text-white">{formatPrice(holding.avgPrice)}</TableCell>
                <TableCell className="px-4 py-5 text-right text-white">{formatPrice(holding.currentPrice)}</TableCell>
                <TableCell className="px-4 py-5">
                  <ProfitLossCell holding={holding} />
                </TableCell>
                <TableCell className="px-6 py-5 text-right">
                  <p className="font-semibold text-white">{formatPrice(holding.marketValue)}</p>
                  <p className="mt-1 text-xs text-white/45">Invested {formatPrice(holding.investedAmount)}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4 md:hidden">
        {holdings.map((holding) => {
          const isProfit = holding.profitLoss >= 0;

          return (
            <Link
              key={holding.stockSymbol}
              href={`/stocks/${holding.stockSymbol}`}
              className="block rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.95)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-fuchsia-600 font-semibold text-white">
                    {holding.stockSymbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{holding.companyName}</p>
                    <p className="text-sm text-white/55">{holding.stockSymbol}</p>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-white/40" />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-white/45">Shares</p>
                  <p className="mt-1 font-medium text-white">{holding.shares}</p>
                </div>
                <div>
                  <p className="text-white/45">Avg Price</p>
                  <p className="mt-1 font-medium text-white">{formatPrice(holding.avgPrice)}</p>
                </div>
                <div>
                  <p className="text-white/45">Current</p>
                  <p className="mt-1 font-medium text-white">{formatPrice(holding.currentPrice)}</p>
                </div>
                <div>
                  <p className="text-white/45">Total Value</p>
                  <p className="mt-1 font-medium text-white">{formatPrice(holding.marketValue)}</p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-white/40">P/L</p>
                  <p className={cn('mt-1 font-semibold', isProfit ? 'text-emerald-400' : 'text-rose-400')}>
                    {isProfit ? '+' : '-'}{formatPrice(Math.abs(holding.profitLoss))}
                  </p>
                </div>
                <div className="text-right">
                  <p className={cn('text-sm font-medium', isProfit ? 'text-emerald-300' : 'text-rose-300')}>
                    {isProfit ? '+' : ''}{holding.profitLossPercent.toFixed(2)}%
                  </p>
                  <p className="mt-1 text-xs text-white/45">Allocation {holding.allocationPercent.toFixed(1)}%</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
