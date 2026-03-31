// database/models/expert.model.ts
import mongoose from 'mongoose';

const expertSchema = new mongoose.Schema({
  expertId: {
    type: String,
    required: true,
    unique: true,
  },
  expertName: {
    type: String,
    required: true,
  },
  stockSymbol: {
    type: String,
    required: true,
  },
  suggestionType: {
    type: String,
    enum: ['BUY', 'SELL', 'HOLD'],
    default: 'HOLD',
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  currentPrice: {
    type: Number,
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50,
  },
  reasoning: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

expertSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const ExpertSuggestion = mongoose.models.ExpertSuggestion || 
  mongoose.model('ExpertSuggestion', expertSchema);

export default ExpertSuggestion;