const mongoose = require('mongoose');

const pitchDeckSchema = new mongoose.Schema({
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  analysis: {
    aiEvaluation: String,
    riskScore: { type: Number, default: 0 },
    investmentReadinessScore: { type: Number, default: 0 },
    swotAnalysis: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String]
    },
    marketValidation: { type: Number, default: 0 },
    revenueModelAssessment: String,
    competitiveStrength: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('PitchDeck', pitchDeckSchema);
