'use server';

import { connectToDatabase } from '@/database/mongoose';
import Alert from '@/database/models/alert.model';
import { getAuth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { sendEmail } from '@/lib/email/sendEmail';
import { alertCreatedTemplate } from '@/lib/email/templates';

// Create a new price alert
export const createAlert = async (
  symbol: string,
  company: string,
  targetPrice: number,
  condition: 'above' | 'below'
) => {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return { success: false, error: 'Please sign in to create alerts' };
    }

    await connectToDatabase();

    // Check for existing active alert
    const existingAlert = await Alert.findOne({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      isTriggered: false,
    });

    if (existingAlert) {
      return { success: false, error: 'You already have an active alert for this stock' };
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
    revalidatePath('/alerts');

    // Send confirmation email
    await sendEmail({
      to: session.user.email,
      subject: `✅ Alert Created: ${symbol} will notify at $${targetPrice}`,
      html: alertCreatedTemplate(symbol, company, targetPrice, condition),
    });

    return { 
      success: true, 
      message: `Alert created! You'll be notified when ${symbol} goes ${condition} $${targetPrice}` 
    };
  } catch (error) {
    console.error('Error creating alert:', error);
    return { success: false, error: 'Failed to create alert' };
  }
};

// Get all active alerts
export const getUserAlerts = async () => {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return [];

    await connectToDatabase();

    const alerts = await Alert.find({
      userId: session.user.id,
      isTriggered: false,
    }).sort({ createdAt: -1 });

    return JSON.parse(JSON.stringify(alerts));
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};

// Delete an alert
export const deleteAlert = async (alertId: string) => {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return { success: false, error: 'Unauthorized' };

    await connectToDatabase();

    await Alert.deleteOne({ _id: alertId, userId: session.user.id });
    revalidatePath('/alerts');

    return { success: true, message: 'Alert deleted' };
  } catch (error) {
    console.error('Error deleting alert:', error);
    return { success: false, error: 'Failed to delete alert' };
  }
};
