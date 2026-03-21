'use client';

import { useState } from "react";
import { buyStock } from "@/lib/actions/buyStock";
import { sellStock } from "@/lib/actions/sellStock";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import RazorpayPayment from "./RazorpayPayment";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"; // ✅ Add these imports

interface Props {
  symbol: string;
  company?: string;
  userId?: string;
  currentPrice?: number;
  availableBalance?: number;
}

export default function BuySellButtons({ 
  symbol, 
  company = symbol, 
  userId = "demo-user",
  currentPrice = 100,
  availableBalance = 60000
}: Props) {
  
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState<"buy" | "sell" | null>(null);
  const [showPayment, setShowPayment] = useState(false);

  const handleBuyClick = () => {
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    router.refresh();
  };

  const handleSell = async () => {
    try {
      setLoading("sell");
      
      const result = await sellStock(userId, symbol, currentPrice, quantity);
      
      if (result.success) {
        toast.success("Order Placed!", {
          description: `Sold ${quantity} shares of ${symbol}`,
        });
        router.refresh();
      } else {
        toast.error("Failed", { description: result.error });
      }
    } catch (error: any) {
      toast.error("Transaction failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <>
      <div className="border rounded-lg p-6 space-y-4 bg-white dark:bg-gray-800">
        <h3 className="text-xl font-bold">Trade {symbol}</h3>
        
        {/* Quantity Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Quantity:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 border rounded-full hover:bg-gray-100"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border rounded p-1"
              min="1"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 border rounded-full hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>

        {/* Price Info */}
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Price per share:</span>
            <span className="font-medium">₹{currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total:</span>
            <span className="font-medium">₹{(currentPrice * quantity).toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleBuyClick}
            disabled={loading !== null}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "buy" ? "Processing..." : `Buy ${symbol}`}
          </button>
          <button
            onClick={handleSell}
            disabled={loading !== null}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading === "sell" ? "Processing..." : `Sell ${symbol}`}
          </button>
        </div>
      </div>

      {/* ✅ Payment Modal - Fixed with DialogTitle */}
      <Dialog open={showPayment} onOpenChange={setShowPayment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>  {/* ✅ Title added */}
          </DialogHeader>
          <RazorpayPayment
            symbol={symbol}
            company={company}
            userId={userId}
            currentPrice={currentPrice}
            quantity={quantity}
            onSuccess={handlePaymentSuccess}
            onClose={() => setShowPayment(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}