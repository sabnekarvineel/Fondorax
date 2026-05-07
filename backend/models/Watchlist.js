const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
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
  notes: {
    type: String,
    default: null
  },
  // Notification preferences
  notifyOnMilestone: {
    type: Boolean,
    default: true
  },
  notifyOnUpdate: {
    type: Boolean,
    default: true
  },
  notifyOnScoreChange: {
    type: Boolean,
    default: true
  },
  // Tags for organization
  tags: [String],
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  // Custom rating (0-5 stars)
  investorRating: {
    type: Number,
    min: 0,
    max: 5,
    default: null
  },
  // Feedback/diligence notes
  dueDiligenceStatus: {
    type: String,
    enum: ['interested', 'evaluating', 'ready-to-invest', 'passed', 'invested'],
    default: 'interested'
  },
  lastNotifiedAt: {
    type: Date,
    default: null
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficient queries
watchlistSchema.index({ investorId: 1, founderId: 1 }, { unique: true });
watchlistSchema.index({ investorId: 1 });
watchlistSchema.index({ priority: 1 });
watchlistSchema.index({ dueDiligenceStatus: 1 });

module.exports = mongoose.model('Watchlist', watchlistSchema);
