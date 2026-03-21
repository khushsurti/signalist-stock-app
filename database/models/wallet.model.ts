import { Schema, model, models } from 'mongoose';

const WalletSchema = new Schema({
  userId: { type: String, required: true, index: true, unique: true },
  balance: { type: Number, default: 100000 }
}, { timestamps: true });

export default models.Wallet || model('Wallet', WalletSchema);