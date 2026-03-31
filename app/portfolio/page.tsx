import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/lib/better-auth/auth';
import PortfolioClient from '@/app/portfolio/PortfolioClient';
import { getPortfolioSnapshot } from '@/lib/services/portfolio.service';

export const dynamic = 'force-dynamic';

export default async function PortfolioPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/sign-in');
  }

  const initialPortfolio = await getPortfolioSnapshot(session.user.id);

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PortfolioClient initialPortfolio={initialPortfolio} />
      </div>
    </div>
  );
}
