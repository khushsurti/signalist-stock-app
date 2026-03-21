import { Star } from 'lucide-react';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import SearchCommand from '@/components/SearchCommand';
import { getWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { WatchlistTable } from '@/components/WatchlistTable';

const Watchlist = async () => {
  // Fetch watchlist data with stock details
  const watchlist = await getWatchlistWithData();
  
  // Fetch initial stocks for search
  const initialStocks = await searchStocks();

  // EMPTY STATE - when watchlist has no items
  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Star className="h-16 w-16 text-yellow-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Your watchlist is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
            Start building your watchlist by searching for stocks 
            and clicking the star icon to add them.
          </p>
          <SearchCommand 
            initialStocks={initialStocks} 
            label="Search Stocks"
          />
        </div>
      </div>
    );
  }

  // POPULATED STATE - when watchlist has items
  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col gap-6">
        
        {/* Header with Title and Search */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Watchlist</h1>
          <SearchCommand 
            initialStocks={initialStocks} 
            label="Add Stocks"
          />
        </div>

        {/* Watchlist Table */}
        <WatchlistTable watchlist={watchlist} />
      </div>
    </div>
  );
};

export default Watchlist;