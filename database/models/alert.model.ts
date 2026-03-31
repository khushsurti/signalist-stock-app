import { Schema, model, models } from 'mongoose';

export interface IAlert {
  userId: string;
  userEmail: string;
  symbol: string;
  company: string;
  targetPrice: number;
  condition: 'above' | 'below';
  isTriggered: boolean;
  triggeredAt?: Date;
  createdAt: Date;
}

const AlertSchema = new Schema({
  userId: { type: String, required: true, index: true },
  userEmail: { type: String, required: true },
  symbol: { type: String, required: true, uppercase: true },
  company: { type: String, required: true },
  targetPrice: { type: Number, required: true },
  condition: { type: String, enum: ['above', 'below'], required: true },
  isTriggered: { type: Boolean, default: false },
  triggeredAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

AlertSchema.index({ symbol: 1, isTriggered: 1 });
AlertSchema.index({ userId: 1, isTriggered: 1 });

const Alert = models.Alert || model('Alert', AlertSchema);
export default Alert;