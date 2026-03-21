'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { buyStock } from '@/lib/actions/buyStock';
import { useRouter } from 'next/navigation';
import { Loader2, CreditCard, Smartphone, Landmark, Lock, Shield } from 'lucide-react';

interface RazorpayPaymentProps {
  symbol: string;
  company: string;
  userId: string;
  currentPrice: number;
  quantity: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayPayment({
  symbol,
  company,
  userId,
  currentPrice,
  quantity,
  onSuccess,
  onClose
}: RazorpayPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');

  const totalAmount = currentPrice * quantity;

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        return;
      }

      const orderResponse = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `stock_${symbol}_${Date.now()}`,
          symbol: symbol,
          quantity: quantity
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error('Failed to create payment order');
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Stock Market App',
        description: `Buying ${quantity} ${quantity > 1 ? 'shares' : 'share'} of ${symbol}`,
        image: '/logo.png',
        order_id: orderData.id,
        handler: async function (response: any) {
          const verifyResponse = await fetch('/api/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            toast.success('Payment successful! Processing your order...');
            
            const buyResult = await buyStock(userId, symbol, company, currentPrice, quantity);

            if (buyResult.success) {
              toast.success('Stock purchased successfully!', {
                description: `Bought ${quantity} ${quantity > 1 ? 'shares' : 'share'} of ${symbol}`,
              });
              router.refresh();
              onSuccess?.();
            } else {
              toast.error('Payment succeeded but failed to add stock', {
                description: buyResult.error,
              });
            }
          } else {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: 'User Name',
          email: 'user@example.com',
          contact: '9999999999',
        },
        notes: {
          symbol: symbol,
          quantity: quantity,
          price: currentPrice
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            onClose?.();
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-5">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Lock className="w-5 h-5" />
          Secure Payment
        </h2>
        <p className="text-blue-100 text-sm mt-1">Complete your purchase securely</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Order Summary Card */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
            Order Summary
          </h3>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{quantity}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">
                  {quantity > 1 ? 'shares' : 'share'} of
                </span>
                <span className="font-bold text-blue-600 ml-1">{symbol}</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                ₹{totalAmount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
              <span>Price per share</span>
              <span className="font-medium">₹{currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Payment Method
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                paymentMethod === 'card'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <CreditCard className={`w-5 h-5 ${
                paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium ${
                paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                Card
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('upi')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                paymentMethod === 'upi'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <Smartphone className={`w-5 h-5 ${
                paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium ${
                paymentMethod === 'upi' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                UPI
              </span>
            </button>

            <button
              onClick={() => setPaymentMethod('netbanking')}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition ${
                paymentMethod === 'netbanking'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
            >
              <Landmark className={`w-5 h-5 ${
                paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-gray-500'
              }`} />
              <span className={`text-xs font-medium ${
                paymentMethod === 'netbanking' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                NetBanking
              </span>
            </button>
          </div>
        </div>

        {/* Test Card Info */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
          <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Test Mode - Use these details
          </h4>
          <div className="space-y-2 text-xs text-yellow-700 dark:text-yellow-500">
            <p className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">💳 Card:</span>
              <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">
                4111 1111 1111 1111
              </code>
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">📅 Expiry:</span>
              Any future date (e.g., 12/25)
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">🔒 CVV:</span>
              Any 3 digits (e.g., 123)
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium min-w-[80px]">📱 UPI:</span>
              <code className="bg-yellow-100 dark:bg-yellow-900/40 px-2 py-1 rounded">
                success@razorpay
              </code>
            </p>
          </div>
          <div className="mt-3 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-lg flex items-center gap-2">
            <span className="text-lg">⚡</span>
            Payment successful hone ke baad stock automatically buy hoga
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              Pay ₹{totalAmount.toFixed(2)}
            </>
          )}
        </button>

        {/* Footer Note */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secure payment by Razorpay • Stock will be bought automatically after payment
          </p>
        </div>
      </div>
    </div>
  );
}