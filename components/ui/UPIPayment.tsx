'use client';

import { useState, useEffect } from 'react';
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
  Wallet,
  Building2,
  Clock,
  Shield,
  Sparkles,
  ArrowRight,
  CircleCheckBig
} from 'lucide-react';

interface UPIPaymentProps {
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

export default function UPIPayment({
  symbol,
  company,
  userId,
  currentPrice,
  quantity,
  onSuccess,
  onClose
}: UPIPaymentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<'enter' | 'processing' | 'success'>('enter');

  const totalAmount = currentPrice * quantity;
  const testUpiId = 'success@razorpay';

  // Popular UPI apps
  const upiApps = [
    { name: 'Google Pay', id: 'gpay', icon: '📱', color: 'from-blue-500 to-blue-600' },
    { name: 'PhonePe', id: 'phonepe', icon: '💜', color: 'from-purple-500 to-purple-600' },
    { name: 'Paytm', id: 'paytm', icon: '💙', color: 'from-blue-400 to-blue-500' },
    { name: 'BHIM', id: 'bhim', icon: '🇮🇳', color: 'from-orange-500 to-orange-600' },
    { name: 'Amazon Pay', id: 'amazon', icon: '🛍️', color: 'from-orange-400 to-orange-500' },
    { name: 'Other UPI', id: 'other', icon: '🏦', color: 'from-gray-500 to-gray-600' }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('UPI ID copied!');
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

  const handleUPIPayment = async () => {
    if (!upiId) {
      toast.error('Please enter UPI ID');
      return;
    }

    setPaymentStep('processing');
    setLoading(true);
    setErrorMessage(null);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error('Failed to load payment gateway');
        setPaymentStep('enter');
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
          symbol: symbol,
          quantity: quantity
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        toast.error(orderData.error || 'Failed to create payment order');
        setPaymentStep('enter');
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Signalist',
        description: `Buying ${quantity} share(s) of ${symbol} (${company})`,
        order_id: orderData.id,
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false
        },
        handler: async function (response: any) {
          setPaymentStep('success');
          
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
            toast.success('✅ Payment successful! Processing your order...');
            
            const buyResult = await buyStock(userId, symbol, company, currentPrice, quantity);

            if (buyResult.success) {
              toast.success(`🎉 Successfully bought ${quantity} share(s) of ${symbol}!`);
              setTimeout(() => {
                router.refresh();
                onSuccess?.();
              }, 1500);
            } else {
              toast.error('Payment succeeded but failed to add stock');
            }
          } else {
            toast.error('Payment verification failed');
            setPaymentStep('enter');
          }
        },
        prefill: {
          name: 'Stock Investor',
          email: 'investor@example.com',
          contact: '9876543210',
        },
        notes: {
          symbol: symbol,
          quantity: quantity,
          price: currentPrice,
          company: company,
          upi_id: upiId
        },
        theme: {
          color: '#10b981',
        },
        modal: {
          ondismiss: function () {
            setPaymentStep('enter');
            setLoading(false);
            onClose?.();
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on('payment.failed', function (response: any) {
        const error = response.error || {};
        const errorDesc = error.description || error.message || 'Payment failed';
        
        setErrorMessage(errorDesc);
        toast.error('UPI Payment failed', { description: errorDesc });
        setPaymentStep('enter');
        setLoading(false);
      });

      razorpay.open();
    } catch (error) {
      console.error('UPI Payment error:', error);
      toast.error('Payment failed. Please try again.');
      setPaymentStep('enter');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Premium Header */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-6 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-xs font-medium text-white/80">Instant Payment</span>
            </div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Smartphone className="w-6 h-6" />
              UPI Payment
            </h2>
            <p className="text-emerald-100 text-sm mt-1">Pay via UPI • Get stocks instantly</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-white/80 hover:text-white transition p-1">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Steps Indicator */}
        <div className="flex items-center justify-between px-2">
          {['Enter Details', 'Pay via UPI', 'Complete'].map((step, idx) => (
            <div key={step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                paymentStep === 'enter' && idx === 0 ? 'bg-emerald-600 text-white' :
                paymentStep === 'processing' && idx === 1 ? 'bg-emerald-600 text-white' :
                paymentStep === 'success' && idx === 2 ? 'bg-emerald-600 text-white' :
                'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {idx + 1}
              </div>
              {idx < 2 && (
                <div className={`w-12 h-0.5 mx-1 ${
                  (paymentStep === 'processing' && idx === 0) || paymentStep === 'success' ? 'bg-emerald-600' : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Success Animation */}
        {paymentStep === 'success' && (
          <div className="flex flex-col items-center justify-center py-8 animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
              <CircleCheckBig className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Payment Successful!</h3>
            <p className="text-sm text-gray-500 mt-2 text-center">
              Your shares have been added to portfolio
            </p>
          </div>
        )}

        {/* Main Content - Only show when not in success state */}
        {paymentStep !== 'success' && (
          <>
            {/* Premium Order Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-4">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Order Summary</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{quantity}</p>
                    <p className="text-xs text-gray-500">shares</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">₹{totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">₹{currentPrice.toFixed(2)}/share</p>
                  </div>
                </div>
                
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-gray-600">{symbol}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{company}</span>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 flex items-start gap-2 animate-in slide-in-from-top duration-300">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800 dark:text-red-400">Payment Failed</p>
                  <p className="text-xs text-red-600 dark:text-red-500 mt-0.5">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* UPI Apps Selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Pay using
              </p>
              <div className="grid grid-cols-3 gap-2">
                {upiApps.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedApp(app.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                      selectedApp === app.id
                        ? `bg-gradient-to-r ${app.color} text-white border-transparent shadow-md scale-95`
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}
                  >
                    <span className="text-2xl">{app.icon}</span>
                    <span className={`text-xs font-medium ${
                      selectedApp === app.id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {app.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* UPI Input Section */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  UPI ID / VPA
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@okhdfcbank"
                    className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    autoComplete="off"
                  />
                  <button
                    onClick={() => setUpiId(testUpiId)}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700"
                  >
                    Test
                  </button>
                </div>
              </div>

              {/* Test UPI ID Card */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400">Test Mode UPI ID</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(testUpiId)}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition"
                  >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <code className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-500 block text-center py-2 bg-white/50 dark:bg-black/20 rounded-lg">
                  {testUpiId}
                </code>
                <p className="text-xs text-emerald-600 dark:text-emerald-500 text-center mt-2 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Always successful in test mode
                </p>
              </div>
            </div>

            {/* Quick Payment Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-400 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Quick Guide
              </h4>
              <div className="space-y-2 text-xs text-blue-700 dark:text-blue-500">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <span>Enter your UPI ID (or use test ID)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <span>Click "Pay via UPI" button</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <span>Approve payment in your UPI app</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <span>Stock added to portfolio instantly!</span>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handleUPIPayment}
              disabled={loading || !upiId}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Smartphone className="w-5 h-5" />
                  Pay ₹{totalAmount.toFixed(2)} via UPI
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </>
        )}

        {/* Footer */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            Secured by Razorpay • 100% Safe
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Payment processed instantly • Shares added to portfolio
          </p>
        </div>
      </div>
    </div>
  );
}