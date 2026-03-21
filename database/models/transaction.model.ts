import { Schema, model, models } from 'mongoose';

const TransactionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true },
  type: { type: String, enum: ['BUY', 'SELL'], required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
}, { timestamps: true });

// ✅ Make sure it's exported as default
const Transaction = models.Transaction || model('Transaction', TransactionSchema);
export default Transaction;