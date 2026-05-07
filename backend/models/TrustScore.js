const mongoose = require('mongoose');

const trustScoreSchema = new mongoose.Schema({
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Velocity Score: Based on frequency and consistency of updates
  velocityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Consistency Score: Streak of regular updates
  consistencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Transparency Score: Based on data quality and depth
  transparencyScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Execution Score: Based on shipped features, fixes, and iterations
  executionScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Overall Trust Score (weighted average)
  overallTrustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Metrics tracking
  metrics: {
    // Update frequency
    updatesLast7Days: { type: Number, default: 0 },
    updatesLast30Days: { type: Number, default: 0 },
    updatesLast90Days: { type: Number, default: 0 },
    
    // Consistency tracking
    currentStreak: { type: Number, default: 0 }, // days of consecutive updates
    longestStreak: { type: Number, default: 0 },
    lastUpdateDate: Date,
    
    // Data quality
    totalProofOfWorkEntries: { type: Number, default: 0 },
    verifiedEntries: { type: Number, default: 0 },
    entriesWithMetrics: { type: Number, default: 0 },
    entriesWithCustomerFeedback: { type: Number, default: 0 },
    
    // Execution metrics
    featuresShippedLast30Days: { type: Number, default: 0 },
    bugsFixedLast30Days: { type: Number, default: 0 },
    customerInterviewsLast30Days: { type: Number, default: 0 }
  },
  // Milestone tracking
  milestones: [
    {
      type: {
        type: String,
        enum: ['first-update', '7-day-streak', '30-day-active', '50-score-reached', '100-features-shipped']
      },
      achievedAt: Date,
      details: mongoose.Schema.Types.Mixed
    }
  ],
  // Historical scores for trend analysis
  scoreHistory: [
    {
      date: Date,
      velocityScore: Number,
      consistencyScore: Number,
      transparencyScore: Number,
      executionScore: Number,
      overallTrustScore: Number
    }
  ],
  // Flags
  isFlaggedForReview: {
    type: Boolean,
    default: false
  },
  flagReason: String,
  
  // Calculation metadata
  lastCalculatedAt: {
    type: Date,
    default: Date.now
  },
  calculationVersion: {
    type: Number,
    default: 1
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

// Index for efficient queries
trustScoreSchema.index({ founderId: 1 });
trustScoreSchema.index({ overallTrustScore: -1 });
trustScoreSchema.index({ lastCalculatedAt: -1 });

// Method to calculate trust score
trustScoreSchema.methods.calculateTrustScore = function() {
  const weights = {
    velocity: 0.25,
    consistency: 0.25,
    transparency: 0.25,
    execution: 0.25
  };

  // Calculate weighted average
  this.overallTrustScore = Math.round(
    (this.velocityScore * weights.velocity) +
    (this.consistencyScore * weights.consistency) +
    (this.transparencyScore * weights.transparency) +
    (this.executionScore * weights.execution)
  );

  return this.overallTrustScore;
};

// Method to add to history
trustScoreSchema.methods.recordHistory = function() {
  this.scoreHistory.push({
    date: new Date(),
    velocityScore: this.velocityScore,
    consistencyScore: this.consistencyScore,
    transparencyScore: this.transparencyScore,
    executionScore: this.executionScore,
    overallTrustScore: this.overallTrustScore
  });

  // Keep only last 90 days of history
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  this.scoreHistory = this.scoreHistory.filter(entry => entry.date >= ninetyDaysAgo);
};

module.exports = mongoose.model('TrustScore', trustScoreSchema);
