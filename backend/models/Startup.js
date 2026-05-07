const mongoose = require('mongoose');

const startupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  industry: {
    type: String,
    default: null
  },
  stage: {
    type: String,
    enum: ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C', 'Growth', 'Other'],
    default: 'Idea'
  },
  description: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
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

module.exports = mongoose.model('Startup', startupSchema);
