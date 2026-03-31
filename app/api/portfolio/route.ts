import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/lib/better-auth/auth';
import { getPortfolioSnapshot } from '@/lib/services/portfolio.service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return NextResponse.json({ error: 'Please sign in to view your portfolio.' }, { status: 401 });
    }

    const portfolio = await getPortfolioSnapshot(session.user.id);
    return NextResponse.json(portfolio, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio snapshot:', error);
    return NextResponse.json(
      { error: 'Unable to load portfolio data right now.' },
      { status: 500 }
    );
  }
}
