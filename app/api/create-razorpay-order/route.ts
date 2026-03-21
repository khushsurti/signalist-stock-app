import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR', receipt, symbol, quantity } = await request.json();

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Create order options
    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: receipt || `stock_${symbol}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        symbol: symbol,
        quantity: quantity,
        type: 'stock_purchase'
      }
    };

    // Create order
    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      notes: order.notes
    });
  } catch (error) {
    console.error('Razorpay Order Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}