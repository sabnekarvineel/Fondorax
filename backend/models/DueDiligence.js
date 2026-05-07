const mongoose = require('mongoose');

const dueDiligenceSchema = new mongoose.Schema({
  investorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Startup'
  },
  // Checklist items
  checklist: [
    {
      category: {
        type: String,
        enum: ['team', 'market', 'product', 'financials', 'legal', 'technology', 'execution', 'other']
      },
      items: [
        {
          name: String,
          completed: { type: Boolean, default: false },
          notes: String,
          reviewedAt: Date
        }
      ]
    }
  ],
  // Summary sections
  teamAssessment: {
    strengths: [String],
    concerns: [String],
    overallRating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  marketAssessment: {
    marketSize: String,
    competitiveAdvantage: [String],
    risks: [String],
    overallRating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  productAssessment: {
    productMaturity: {
      type: String,
      enum: ['concept', 'prototype', 'beta', 'production', 'mature']
    },
    keyFeatures: [String],
    techDebt: String,
    overallRating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  financialAssessment: {
    runway: String, // e.g., "18 months"
    monthlyBurn: Number,
    monthlyRevenue: Number,
    fundingHistory: [
      {
        round: String,
        amount: Number,
        date: Date,
        investors: [String]
      }
    ],
    overallRating: { type: Number, min: 1, max: 5 },
    notes: String
  },
  // Overall assessment
  recommendation: {
    type: String,
    enum: ['strong-pass', 'pass', 'maybe', 'weak-pass', 'strong-invest'],
    default: 'maybe'
  },
  investmentCeiling: Number, // Max willing to invest
  investmentFloor: Number, // Min willing to invest
  
  // Risk assessment
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'very-high'],
    default: 'medium'
  },
  riskFactors: [String],
  
  // References and research
  researchDocuments: [
    {
      name: String,
      url: String,
      type: {
        type: String,
        enum: ['article', 'report', 'financial-statement', 'patent', 'other']
      },
      addedAt: Date
    }
  ],
  
  // Signals from proof of work
  executionVelocity: {
    last30Days: Number,
    trend: { type: String, enum: ['increasing', 'stable', 'decreasing'] }
  },
  
  // Timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'archived'],
    default: 'in-progress'
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
dueDiligenceSchema.index({ investorId: 1, founderId: 1 });
dueDiligenceSchema.index({ investorId: 1, status: 1 });
dueDiligenceSchema.index({ recommendation: 1 });

module.exports = mongoose.model('DueDiligence', dueDiligenceSchema);
