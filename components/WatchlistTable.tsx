'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import WatchlistButton from '@/components/WatchlistButton';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner'; // ✅ Import toast
import { Bell } from 'lucide-react'; // ✅ Import icon

const getChangeColorClass = (changePercent: number) => {
  if (changePercent > 0) return 'text-green-600';
  if (changePercent < 0) return 'text-red-600';
  return 'text-gray-600';
};

interface WatchlistTableProps {
  watchlist: Array<{
    company: string;
    symbol: string;
    priceFormatted: string;
    changeFormatted: string;
    changePercent: number;
    marketCap: string;
    peRatio: string;
  }>;
}

export function WatchlistTable({ watchlist }: WatchlistTableProps) {
  const router = useRouter();

  // ✅ Simple alert function
  const handleAddAlert = (symbol: string, company: string) => {
    toast.success('Alert Created!', {
      description: `You will be notified when ${company} (${symbol}) price changes.`,
      duration: 3000,
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 dark:bg-gray-800">
            {WATCHLIST_TABLE_HEADER.map((label) => (
              <TableHead key={label} className="font-semibold">
                {label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {watchlist.map((item, index) => (
            <TableRow
              key={item.symbol + index}
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              onClick={() => router.push(`/stocks/${item.symbol}`)}
            >
              <TableCell className="pl-4 table-cell font-medium">
                {item.company}
              </TableCell>
              <TableCell className="table-cell">{item.symbol}</TableCell>
              <TableCell className="table-cell">
                {item.priceFormatted || '—'}
              </TableCell>
              <TableCell
                className={cn(
                  'table-cell font-medium',
                  getChangeColorClass(item.changePercent)
                )}
              >
                {item.changeFormatted || '—'}
              </TableCell>
              <TableCell className="table-cell">
                {item.marketCap || '—'}
              </TableCell>
              <TableCell className="table-cell">
                {item.peRatio || '—'}
              </TableCell>
              
              {/* ✅ Simple Alert Button */}
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddAlert(item.symbol, item.company)}
                  className="flex items-center gap-1 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 transition"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Add Alert</span>
                </Button>
              </TableCell>

              <TableCell onClick={(e) => e.stopPropagation()}>
                <WatchlistButton
                  symbol={item.symbol}
                  company={item.company}
                  isInWatchlist={true}
                  showTrashIcon={true}
                  type="icon"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}