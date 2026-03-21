"use client"

import { useEffect, useState } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Star } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import { useDebounce } from "@/hooks/useDebounce";
import WatchlistButton from "./WatchlistButton";

interface SearchCommandProps {
  renderAs?: 'button' | 'text';
  label?: string;
  initialStocks?: any[];
}

export default function SearchCommand({ 
  renderAs = 'button', 
  label = 'Search stocks', 
  initialStocks = [] 
}: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<any[]>(initialStocks);

  const isSearchMode = !!searchTerm.trim();
  const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleSearch = async () => {
    if (!isSearchMode) {
      setStocks(initialStocks);
      return;
    }

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch (error) {
      console.error("Search error:", error);
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm]);

  const handleWatchlistChange = (symbol: string, isAdded: boolean) => {
    setStocks(prev => 
      prev.map(stock => 
        stock.symbol === symbol ? { ...stock, isInWatchlist: isAdded } : stock
      )
    );
  }

  return (
    <>
      {renderAs === 'text' ? (
        <span 
          onClick={() => setOpen(true)} 
          className="cursor-pointer hover:text-yellow-400 transition"
        >
          {label}
        </span>
      ) : (
        <Button 
          onClick={() => setOpen(true)} 
          className="bg-yellow-400 text-black hover:bg-yellow-500"
        >
          {label}
        </Button>
      )}
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="relative">
          <CommandInput 
            value={searchTerm} 
            onValueChange={setSearchTerm} 
            placeholder="Search stocks by symbol or company name..." 
            className="py-3"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 animate-spin text-gray-500" />
          )}
        </div>
        
        <CommandList className="max-h-[400px] overflow-y-auto p-2">
          {loading ? (
            <CommandEmpty className="p-4 text-center text-gray-500">
              Loading stocks...
            </CommandEmpty>
          ) : displayStocks?.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {isSearchMode ? 'No results found' : 'No stocks available'}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="px-2 py-1 text-sm text-gray-500">
                {isSearchMode ? 'Search results' : 'Popular stocks'} ({displayStocks?.length || 0})
              </div>
              
              {displayStocks?.map((stock, index) => {
                // Create a truly unique key
                const uniqueKey = `${stock.symbol}-${stock.exchange || 'US'}-${index}`;
                
                return (
                  <Link
                    key={uniqueKey}
                    href={`/stocks/${stock.symbol}`}
                    className="block"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition group">
                      {/* Stock Icon with first letter */}
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                        {stock.symbol?.charAt(0) || '?'}
                      </div>
                      
                      {/* Stock Details - Properly formatted */}
                      <div className="flex-1 min-w-0">
                        {/* Company Name - Single line */}
                        <div className="font-semibold text-gray-900 dark:text-white truncate">
                          {stock.name || 'Unknown Company'}
                        </div>
                        
                        {/* Stock Info - Horizontal layout */}
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="font-mono font-medium">{stock.symbol}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span>{stock.exchange || 'US'}</span>
                          <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                          <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                            {stock.type || 'Stock'}
                          </span>
                        </div>
                      </div>

                      {/* Watchlist Button */}
                      <div onClick={(e) => e.preventDefault()} className="flex-shrink-0">
                        <WatchlistButton
                          symbol={stock.symbol}
                          company={stock.name}
                          isInWatchlist={stock.isInWatchlist || false}
                          onWatchlistChange={handleWatchlistChange}
                          type="icon"
                        />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CommandList>
      </CommandDialog>
    </>
  )
}