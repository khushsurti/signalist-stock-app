import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
  try {
    const { amount, currency = 'INR', receipt, symbol, quantity } = await request.json();

    const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const serverKeyId = process.env.RAZORPAY_KEY_ID || publicKey;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    console.log('=================================');
    console.log('Creating Razorpay Order');
    console.log('=================================');
    console.log('Amount:', amount);
    console.log('Currency:', currency);
    console.log('Key ID:', serverKeyId);
    console.log('Key Secret:', keySecret ? 'Present' : 'Missing');
    console.log('Symbol:', symbol);
    console.log('Quantity:', quantity);

    if (!serverKeyId || !keySecret) {
      console.error('Razorpay keys missing in .env');
      return NextResponse.json(
        { success: false, error: 'Razorpay configuration missing' },
        { status: 500 }
      );
    }

    if (publicKey && serverKeyId !== publicKey) {
      console.error('Razorpay key mismatch between server and client key ID');
      return NextResponse.json(
        { success: false, error: 'Razorpay key mismatch. Please check env keys.' },
        { status: 500 }
      );
    }

    if (!serverKeyId.startsWith('rzp_test')) {
      console.warn('Using production keys in test mode. Test UPI IDs will not work.');
    }

    const razorpay = new Razorpay({
      key_id: serverKeyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(amount * 100),
      currency,
      receipt: receipt || `stock_${symbol}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        symbol: symbol || '',
        quantity: quantity || 0,
        type: 'stock_purchase',
      },
    };

    console.log('Order Options:', options);

    const order = await razorpay.orders.create(options);

    console.log('Order created successfully');
    console.log('Order ID:', order.id);
    console.log('Order Amount:', order.amount);
    console.log('=================================');

    return NextResponse.json({
      success: true,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay Order Error:', error);
    console.error('Error details:', error?.error || error);

    let errorMessage = 'Failed to create payment order';
    let errorCode = 'UNKNOWN_ERROR';

    if (error?.error?.description) {
      errorMessage = error.error.description;
      errorCode = error.error.code;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode,
      },
      { status: 500 }
    );
  }
}
