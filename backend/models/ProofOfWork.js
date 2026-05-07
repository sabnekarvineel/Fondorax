const mongoose = require('mongoose');

const proofOfWorkSchema = new mongoose.Schema({
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['product-changelog', 'customer-interview', 'growth-metric', 'customer-feedback', 'iteration', 'revenue-milestone'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Product Changelog specific fields
  changelog: {
    features: [String],
    bugFixes: [String],
    improvements: [String],
    releaseNotes: String
  },
  // Customer Interview specific fields
  customerInterview: {
    customerName: String,
    companyName: String,
    interviewDate: Date,
    videoUrl: String,
    transcriptUrl: String,
    keyInsights: [String],
    feedback: String,
    recordingDuration: Number // in minutes
  },
  // Growth Metrics
  metrics: {
    iterationFrequency: { type: Number, default: 0 },
    executionVelocity: { type: Number, default: 0 },
    consistencyScore: { type: Number, default: 0 },
    // New metrics for transparency
    mau: { type: Number, default: 0 }, // Monthly Active Users
    dailyActivationRate: { type: Number, default: 0 }, // Percentage
    churnRate: { type: Number, default: 0 }, // Percentage
    nps: { type: Number, default: 0 }, // Net Promoter Score
    mrr: { type: Number, default: 0 } // Monthly Recurring Revenue
  },
  // Media attachments
  attachments: [{
    type: {
      type: String,
      enum: ['video', 'image', 'document', 'spreadsheet', 'recording']
    },
    url: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  executionScore: {
    type: Number,
    default: 0
  },
  velocityScore: {
    type: Number,
    default: 0
  },
  transparencyScore: {
    type: Number,
    default: 0
  },
  // Verification system
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verificationNotes: String,
  // Timeline metadata
  timestamp: {
    type: Date,
    default: Date.now
  },
  displayDate: {
    type: Date,
    required: true
  },
  // Ledger status
  isPublic: {
    type: Boolean,
    default: true
  },
  engagement: {
    views: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
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

proofOfWorkSchema.methods.calculateScore = function() {
  const metrics = this.metrics;
  const baseScore = (metrics.iterationFrequency * 0.2 + metrics.executionVelocity * 0.3 + metrics.consistencyScore * 0.2);
  
  // Bonus for having real customer data
  let transparencyBonus = 0;
  if (this.customerInterview?.customerName) transparencyBonus += 15;
  if (this.metrics.nps > 0) transparencyBonus += 10;
  if (this.metrics.mau > 0) transparencyBonus += 10;
  if (this.attachments?.length > 0) transparencyBonus += 5;
  
  this.executionScore = Math.min(100, baseScore + transparencyBonus);
  this.transparencyScore = Math.min(100, transparencyBonus);
  this.velocityScore = Math.min(100, baseScore);
  
  return this.executionScore;
};

proofOfWorkSchema.methods.getTimelineMetadata = function() {
  return {
    timestamp: this.displayDate || this.createdAt,
    type: this.type,
    title: this.title,
    scores: {
      execution: this.executionScore,
      transparency: this.transparencyScore,
      velocity: this.velocityScore
    }
  };
};

module.exports = mongoose.model('ProofOfWork', proofOfWorkSchema);
