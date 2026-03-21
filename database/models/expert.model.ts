// database/models/expert-suggestion.model.ts
import mongoose from 'mongoose';

const expertSuggestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  expert: {
    type: String,
    required: true,
  },
  stock: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
  },
  sentiment: {
    type: String,
    enum: ['positive', 'negative', 'neutral'],
    default: 'neutral',
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

// Export the model
export default mongoose.models.ExpertSuggestion || 
  mongoose.model('ExpertSuggestion', expertSuggestionSchema);
