const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup',
    required: true
  },
  pitchData: {
    problem: String,
    market_size: String,
    revenue_model: String,
    traction: {
      indicators: [String],
      stage: String,
      users: Number,
      runway: Number,
      burn_rate: Number
    },
    team: String,
    competition: String,
    risks: [String],
    strengths: [String],
    stage: String,
    funding_ask: String
  },
  riskAnalysis: {
    red_flags: [String],
    green_flags: [String],
    risk_level: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    risk_summary: String
  },
  scores: {
    founderScore: Number,
    marketScore: Number,
    tractionScore: Number,
    totalScore: Number
  },
  executiveSummary: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Analysis', analysisSchema);
