import TradingViewWidget from "@/components/TradingViewWidget";
import {
    HEATMAP_WIDGET_CONFIG,
    MARKET_DATA_WIDGET_CONFIG,
    MARKET_OVERVIEW_WIDGET_CONFIG,
    TOP_STORIES_WIDGET_CONFIG
} from "@/lib/constants";
import { connectToDatabase } from '@/database/mongoose';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import React from 'react'; // ✅ Add React import

// Type for suggestions
interface SuggestionType {
  _id?: string;
  expertId?: string;
  expertName?: string;
  stockSymbol?: string;
  suggestionType?: string;
  targetPrice?: number;
  confidenceScore?: number;
  reasoning?: string;
  [key: string]: any;
}

const Home = async () => {
    const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

    // Suggestions data
    let topSuggestions: SuggestionType[] = [];
    
    try {
        await connectToDatabase();
        
        const ExpertSuggestionModule = await import('@/database/models/expert.model').catch(() => null);
        const ExpertSuggestion = ExpertSuggestionModule?.default;
        
        if (ExpertSuggestion) {
            const suggestions = await ExpertSuggestion.find({ 
                isActive: true,
                expiresAt: { $gt: new Date() }
            })
                .sort({ confidenceScore: -1, createdAt: -1 })
                .limit(4)
                .lean()
                .catch(() => []);
            
           topSuggestions = (suggestions || []) as SuggestionType[];
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error);
    }

    // ✅ Fix Line 48 - Use lowercase for variable, capitalize for component
    let SuggestionCardComponent = null;
    try {
        const module = await import('@/components/ui/ExpertSuggestionCard').catch(() => null);
        SuggestionCardComponent = module?.default;
    } catch (error) {
        console.log('ExpertSuggestionCard not available');
    }

    return (
        <div className="flex min-h-screen home-wrapper">
            {/* First Row - Market Overview and Heatmap */}
            <section className="grid w-full gap-8 home-section">
                <div className="md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        title="Market Overview"
                        scriptUrl={`${scriptUrl}market-overview.js`}
                        config={MARKET_OVERVIEW_WIDGET_CONFIG}
                        className="custom-chart"
                        height={600}
                    />
                </div>
                <div className="md-col-span xl:col-span-2">
                    <TradingViewWidget
                        title="Stock Heatmap"
                        scriptUrl={`${scriptUrl}stock-heatmap.js`}
                        config={HEATMAP_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>

            {/* Expert Suggestions Section */}
            {SuggestionCardComponent && topSuggestions.length > 0 && (
                <section className="mt-12 px-4">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-blue-600" />
                            Real-time Expert Suggestions
                        </h2>
                        <Link 
                            href="/suggestions" 
                            className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-medium"
                        >
                            View All Suggestions
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {topSuggestions.map((suggestion: SuggestionType) => {
                            // ✅ Fix: Create a capitalized variable inside the map
                            const Card = SuggestionCardComponent;
                            return (
                                <Card 
                                    key={suggestion._id?.toString() || Math.random()}
                                    suggestion={suggestion}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Second Row - News and Market Data */}
            <section className="grid w-full gap-8 home-section">
                <div className="h-full md:col-span-1 xl:col-span-1">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}timeline.js`}
                        config={TOP_STORIES_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
                <div className="h-full md:col-span-1 xl:col-span-2">
                    <TradingViewWidget
                        scriptUrl={`${scriptUrl}market-quotes.js`}
                        config={MARKET_DATA_WIDGET_CONFIG}
                        height={600}
                    />
                </div>
            </section>
        </div>
    )
}

export default Home;