const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  investments: [{
    startupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    investmentAmount: Number,
    equity: Number,
    investmentDate: Date,
    status: {
      type: String,
      enum: ['active', 'exited', 'failed'],
      default: 'active'
    }
  }],
  analytics: {
    totalInvestment: { type: Number, default: 0 },
    portfolioValue: { type: Number, default: 0 },
    roiPercentage: { type: Number, default: 0 },
    diversificationScore: { type: Number, default: 0 }
  },
  sectorDistribution: [{
    sector: String,
    percentage: Number
  }],
  riskMetrics: {
    overallRisk: { type: Number, default: 0 },
    highRiskCount: { type: Number, default: 0 },
    mediumRiskCount: { type: Number, default: 0 },
    lowRiskCount: { type: Number, default: 0 }
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

module.exports = mongoose.model('Portfolio', portfolioSchema);
