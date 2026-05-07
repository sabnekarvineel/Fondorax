const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['government', 'private', 'accelerator', 'loan'],
    required: true,
  },
  organization: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  fundingAmount: {
    type: String,
    // e.g., "₹20 Lakhs - ₹50 Lakhs"
  },
  stage: {
    type: [String],
    // Idea, MVP, Early Revenue, Growth, Series A, Series B
  },
  sector: {
    type: [String],
    // Tech, EdTech, AgriTech, FinTech, HealthTech, etc.
  },
  eligibility: {
    type: String,
    required: true,
  },
  requirements: {
    type: [String],
    default: [],
  },
  location: {
    type: [String],
    default: ['India'],
  },
  deadline: {
    type: Date,
  },
  link: {
    type: String,
    required: true,
  },
  applicationUrl: String,
  contactEmail: String,
  isFeatured: {
    type: Boolean,
    default: false,
  },
  featuredUntil: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  verifiedAt: Date,
  createdBy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
resourceSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resource', resourceSchema);
