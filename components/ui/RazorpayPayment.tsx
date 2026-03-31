'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { buyStock } from '@/lib/actions/buyStock';
import { useRouter } from 'next/navigation';
import {
  Loader2,
  Smartphone,
  Lock,
  Copy,
  Check,
  AlertCircle,
  X,
  QrCode,
  Landmark,
  ShieldCheck,
  TrendingUp,
  BadgeIndianRupee,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

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
  onClose,
}: RazorpayPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalAmount = currentPrice * quantity;
  const testUpiId = 'success@razorpay';
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
  const isTestMode = razorpayKey.startsWith('rzp_test');
  const isUpiSelected = paymentMethod === 'upi';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID copied');
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const methodLabel = isUpiSelected ? 'UPI' : 'Netbanking';

  const validateInputs = (): string | null => {
    if (!razorpayKey) return 'Payment key is missing. Please contact support.';

    if (paymentMethod === 'upi') {
      const trimmedUpiId = upiId.trim().toLowerCase();
      if (!trimmedUpiId) return 'Please enter UPI ID';
      if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/i.test(trimmedUpiId)) {
        return 'Enter a valid UPI ID (example@bank)';
      }
      if (isTestMode && trimmedUpiId !== testUpiId) {
        setUpiId(testUpiId);
        return 'Test mode me UPI ke liye success@razorpay use karein.';
      }
    }

    return null;
  };

  const handlePayment = async () => {
    const validationError = validateInputs();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setLoading(false);
        return;
      }

      const orderResponse = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: totalAmount,
          currency: 'INR',
          receipt: `stock_${symbol}_${Date.now()}`,
          symbol,
          quantity,
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order');
        setLoading(false);
        return;
      }

      const trimmedUpiId = upiId.trim().toLowerCase();
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Signalist',
        description: `Buying ${quantity} share(s) of ${symbol} (${company})`,
        order_id: orderData.id,
        method: {
          upi: paymentMethod === 'upi',
          card: false,
          netbanking: paymentMethod === 'netbanking',
          wallet: false,
        },
        handler: async (response: any) => {
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
          if (!verifyData.success) {
            toast.error('Payment verification failed');
            return;
          }

          const buyResult = await buyStock(userId, symbol, company, currentPrice, quantity);
          if (buyResult.success) {
            toast.success(`Successfully bought ${quantity} share(s) of ${symbol}`);
            router.refresh();
            onSuccess?.();
          } else {
            toast.error('Payment succeeded but failed to add stock', {
              description: buyResult.error,
            });
          }
        },
        prefill: {
          name: 'Stock Investor',
          email: 'investor@example.com',
          contact: '9876543210',
        },
        notes: {
          symbol,
          quantity,
          price: currentPrice,
          company,
          payment_method: paymentMethod,
          upi_id: paymentMethod === 'upi' ? trimmedUpiId : '',
        },
        theme: { color: '#10b981' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onClose?.();
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response: any) => {
        const error = response?.error && typeof response.error === 'object' ? response.error : {};
        const errorDesc = error.description || error.message || 'Payment failed. Please try again.';
        const errorCode = error.code || '';
        const errorReason = error.reason || '';

        console.warn('Razorpay payment failed', {
          description: errorDesc,
          code: errorCode,
          reason: errorReason,
          source: error.source,
          step: error.step,
          method: paymentMethod,
        });

        const normalizedError = `${errorDesc} ${errorCode} ${errorReason}`.toLowerCase();
        let friendlyMessage = errorDesc;

        if (
          normalizedError.includes('temporarily') ||
          normalizedError.includes('try again') ||
          normalizedError.includes('trouble') ||
          normalizedError.includes('server')
        ) {
          friendlyMessage = 'Gateway issue aa rahi hai. 30-60 sec baad dobara try karein.';
        } else if (isTestMode && paymentMethod === 'upi') {
          friendlyMessage = 'Test mode me UPI ke liye success@razorpay use karein.';
        }

        setErrorMessage(friendlyMessage);
        toast.error('Payment failed', { description: friendlyMessage, duration: 5000 });
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.warn('Razorpay payment flow error', error);
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-[26px] border border-emerald-100 bg-white shadow-[0_24px_80px_-32px_rgba(16,185,129,0.55)] dark:border-emerald-900/40 dark:bg-gray-950">
      <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.26),_transparent_32%),linear-gradient(135deg,_#047857_0%,_#10b981_55%,_#34d399_100%)] px-5 pb-5 pt-4 text-white">
        <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-0 h-16 w-16 rounded-full bg-black/10 blur-2xl" />
        <div className="relative flex items-start justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-emerald-50">
              <Sparkles className="h-3.5 w-3.5" />
              Smart Checkout
            </div>
            <div>
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <Lock className="h-5 w-5" />
                Razorpay Payment
              </h2>
              <p className="mt-1 text-xs text-emerald-50/90">
                Securely complete your {symbol} purchase with {methodLabel}.
              </p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative mt-4 grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-white/15 bg-white/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-50/80">
              <BadgeIndianRupee className="h-4 w-4" />
              Payable Now
            </div>
            <p className="mt-1.5 text-2xl font-bold tracking-tight">INR {totalAmount.toFixed(2)}</p>
            <p className="mt-1 text-xs text-emerald-50/75">{quantity} share(s) included</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-black/10 p-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-50/80">
              <TrendingUp className="h-4 w-4" />
              Live Order
            </div>
            <p className="mt-1.5 text-base font-semibold">{symbol}</p>
            <p className="mt-1 line-clamp-2 text-xs text-emerald-50/75">{company}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="rounded-[22px] border border-gray-100 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/70">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                Order Summary
              </p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">{symbol}</p>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {quantity} Qty
            </div>
          </div>

          <div className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>Price per share</span>
              <span className="font-medium text-gray-900 dark:text-white">INR {currentPrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-gray-600 dark:text-gray-300">
              <span>Company</span>
              <span className="max-w-[55%] truncate font-medium text-gray-900 dark:text-white">{company}</span>
            </div>
            <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-3 text-base font-semibold text-gray-900 dark:border-gray-700 dark:text-white">
              <span>Total Amount</span>
              <span className="text-emerald-600 dark:text-emerald-400">INR {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-3.5 dark:border-red-900/50 dark:bg-red-950/30">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">Payment Failed</p>
              <p className="mt-1 text-xs text-red-700 dark:text-red-400">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">Payment Method</label>
            <span className="text-xs text-gray-500 dark:text-gray-400">Choose how you want to pay</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`rounded-2xl border p-3.5 text-left transition-all ${
                isUpiSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100 dark:border-emerald-500/70 dark:bg-emerald-950/30'
                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <Smartphone className={`h-5 w-5 ${isUpiSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                <div className={`h-2.5 w-2.5 rounded-full ${isUpiSelected ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">UPI</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Fastest option for instant payment</p>
            </button>

            <button
              type="button"
              onClick={() => setPaymentMethod('netbanking')}
              className={`rounded-2xl border p-3.5 text-left transition-all ${
                !isUpiSelected
                  ? 'border-emerald-500 bg-emerald-50 shadow-sm shadow-emerald-100 dark:border-emerald-500/70 dark:bg-emerald-950/30'
                  : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-emerald-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <Landmark className={`h-5 w-5 ${!isUpiSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500'}`} />
                <div className={`h-2.5 w-2.5 rounded-full ${!isUpiSelected ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-900 dark:text-white">Netbanking</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Continue via your bank in Razorpay</p>
            </button>
          </div>
        </div>

        {isUpiSelected ? (
          <div className="space-y-3 rounded-[22px] border border-emerald-100 bg-[linear-gradient(180deg,_rgba(236,253,245,0.9),_rgba(255,255,255,1))] p-4 dark:border-emerald-900/40 dark:bg-[linear-gradient(180deg,_rgba(6,78,59,0.18),_rgba(3,7,18,0.35))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Enter your UPI ID</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Example: name@okaxis or mobile@upi</p>
              </div>
              {isTestMode && (
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Test Mode
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@okhdfcbank"
                className="flex-1 rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm outline-none transition placeholder:text-gray-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 dark:border-emerald-900/50 dark:bg-gray-950 dark:text-white dark:focus:ring-emerald-900/40"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setUpiId(testUpiId)}
                className="rounded-2xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-900/50 dark:bg-gray-950 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              >
                Use Test ID
              </button>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-white/90 p-3.5 shadow-sm dark:border-emerald-900/50 dark:bg-gray-950/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-emerald-100 p-2 dark:bg-emerald-950/60">
                    <QrCode className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">Razorpay Test UPI</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Use this for successful sandbox payments</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(testUpiId)}
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-950/70"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <code className="mt-3 block rounded-xl bg-gray-950 px-4 py-2.5 text-center text-sm font-semibold tracking-wide text-emerald-300">
                {testUpiId}
              </code>
            </div>
          </div>
        ) : (
          <div className="rounded-[22px] border border-sky-100 bg-sky-50/70 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2.5 shadow-sm dark:bg-sky-950/40">
                <Landmark className="h-5 w-5 text-sky-600 dark:text-sky-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Netbanking selected</p>
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  You&apos;ll be redirected inside Razorpay to choose your bank and authorize the payment.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-[22px] border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Payment Flow
          </div>
          <div className="mt-3 space-y-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">1</span>
              Choose {methodLabel} as your payment mode
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">2</span>
              Complete checkout inside Razorpay
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">3</span>
              Your shares are added after successful verification
            </div>
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading || (isUpiSelected && !upiId.trim())}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,_#047857_0%,_#10b981_55%,_#34d399_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-18px_rgba(16,185,129,0.85)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-18px_rgba(16,185,129,0.95)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              {isUpiSelected ? <Smartphone className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
              Pay INR {totalAmount.toFixed(2)} via {methodLabel}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="text-center">
          <p className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Lock className="h-3.5 w-3.5" />
            Secure payment powered by Razorpay
          </p>
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
            Portfolio updates right after successful verification
          </p>
        </div>
      </div>
    </div>
  );
}
