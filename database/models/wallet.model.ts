import { Schema, model, models } from 'mongoose';

const WalletSchema = new Schema({
  userId: { type: String, required: true, index: true, unique: true },
  balance: { type: Number, default: 100000, min: 0 }
}, {
  timestamps: true,
  versionKey: false,
});

export default models.Wallet || model('Wallet', WalletSchema);
