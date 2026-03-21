import { Schema, model, models } from 'mongoose';

const PortfolioSchema = new Schema({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true },
  company: { type: String, required: true },
  quantity: { type: Number, required: true },
  avgPrice: { type: Number, required: true }
}, { timestamps: true });

PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default models.Portfolio || model('Portfolio', PortfolioSchema);