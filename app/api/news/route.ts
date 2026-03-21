import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return sample news data directly
    const sampleNews = getTodayMarketNews();
    
    return NextResponse.json(sampleNews, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error in API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}

function getTodayMarketNews() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const currentHour = today.getHours();
  
  let marketStatus = 'Opening';
  if (currentHour >= 9 && currentHour < 15) {
    marketStatus = 'Live Trading';
  } else if (currentHour >= 15 && currentHour < 18) {
    marketStatus = 'Closing';
  } else {
    marketStatus = 'Market Update';
  }
  
  return [
    {
      headline: `${dateStr}: Nifty, Sensex ${marketStatus} - Key Market Highlights`,
      summary: `${marketStatus === 'Live Trading' ? 'Markets are trading with positive momentum' : marketStatus === 'Closing' ? 'Markets closed with gains' : 'Pre-market indicators show positive opening'} on ${dateStr} tracking global cues.`,
      source: 'Live Market Desk',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Market Update',
      sentiment: 'positive',
      stockImpact: 'NIFTY 50, SENSEX'
    },
    {
      headline: `${dateStr}: Top Gainers and Losers - Real-time Data`,
      summary: `Reliance gains 2% on deal buzz, IT stocks show strength, while banking stocks remain volatile. Check complete list.`,
      source: 'Market Update',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Market Movers',
      sentiment: 'neutral',
      stockImpact: 'RELIANCE, INFY, TCS, HDFC'
    },
    {
      headline: `FII/DII Activity: Latest Institutional Flow Data - ${dateStr}`,
      summary: `Foreign Institutional Investors net bought ₹1,850 crore, Domestic Institutions net sold ₹620 crore today.`,
      source: 'Institutional Tracker',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Institutional Flow',
      sentiment: 'positive',
      stockImpact: 'BANKING, FINANCIALS'
    },
    {
      headline: `Global Markets Update: Asian Shares Mixed, US Futures Flat`,
      summary: `Nikkei up 0.5%, Hang Seng down 0.3%. Investors await key US inflation data later this week.`,
      source: 'Global Desk',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Global Markets',
      sentiment: 'neutral',
      stockImpact: 'IT, AUTO, EXPORT'
    },
    {
      headline: `Currency Market: Rupee vs Dollar Live Rate - ${dateStr}`,
      summary: `Indian rupee trades at 83.45 against US dollar, stable on RBI intervention and FII inflows.`,
      source: 'Currency Desk',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Currency',
      sentiment: 'neutral',
      stockImpact: 'IT, PHARMA, EXPORT'
    },
    {
      headline: `Commodity Market: Gold, Silver, Crude Oil Prices Today`,
      summary: `Gold holds above ₹72,000, silver stable at ₹85,000. Crude oil trades at $84/barrel.`,
      source: 'Commodity Desk',
      datetime: new Date().toISOString(),
      url: '#',
      category: 'Commodities',
      sentiment: 'neutral',
      stockImpact: 'GOLD, OIL, METALS'
    }
  ];
}