import { NextResponse } from 'next/server';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { connectToDatabase } from '@/database/mongoose';
import Alert from '@/database/models/alert.model';

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Please sign in to create alerts' },
        { status: 401 }
      );
    }

    const { symbol, company, targetPrice, condition } = await request.json();

    // Validation
    if (!symbol || !targetPrice || !condition) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check for existing active alert
    const existingAlert = await Alert.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      isTriggered: false,
    });

    if (existingAlert) {
      return NextResponse.json(
        { success: false, error: 'You already have an active alert for this stock' },
        { status: 400 }
      );
    }

    // Create new alert
    const alert = new Alert({
      userId: session.user.id,
      userEmail: session.user.email,
      symbol: symbol.toUpperCase(),
      company,
      targetPrice,
      condition,
      isTriggered: false,
    });

    await alert.save();

    console.log(`✅ Alert created: ${symbol} ${condition} $${targetPrice} for ${session.user.email}`);

    return NextResponse.json({
      success: true,
      message: `Alert created! You'll be notified when ${symbol} goes ${condition} $${targetPrice}`,
      alert: {
        id: alert._id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition,
      },
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}