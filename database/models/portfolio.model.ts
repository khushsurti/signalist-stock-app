import { Schema, model, models } from 'mongoose';

const PortfolioSchema = new Schema({
  userId: { type: String, required: true, index: true },
  symbol: { type: String, required: true, uppercase: true, trim: true },
  company: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },
  avgPrice: { type: Number, required: true, min: 0 }
}, {
  timestamps: true,
  versionKey: false,
});

PortfolioSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default models.Portfolio || model('Portfolio', PortfolioSchema);
