const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  // Relationship
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Marketplace',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Deal Status Flow
  status: {
    type: String,
    enum: ['interested', 'nda_pending', 'nda_signed', 'due_diligence', 'negotiating', 'closed'],
    default: 'interested'
  },

  // Timeline
  interestedAt: {
    type: Date,
    default: Date.now
  },
  ndaSentAt: Date,
  ndaSignedAt: Date,
  dueDiligenceStartedAt: Date,
  negotiationStartedAt: Date,
  closedAt: Date,

  // Deal Terms
  listingPrice: Number,
  offerPrice: Number,
  agreedPrice: Number,

  // NDA
  ndaUrl: String,
  ndaSignedByBuyer: { type: Boolean, default: false },
  ndaSignedBySeller: { type: Boolean, default: false },

  // Due Diligence Documents
  dueDiligenceDocuments: [{
    name: String,
    url: String,
    type: { type: String }, // e.g., 'revenue_proof', 'customer_list', 'contract'
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Negotiation History
  negotiationHistory: [{
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    proposedPrice: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],

  // Escrow & Payment
  escrowStatus: {
    type: String,
    enum: ['pending', 'funded', 'released', 'refunded'],
    default: 'pending'
  },
  escrowTransactionId: String,
  
  platformCommissionPercent: { type: Number, default: 3 },
  platformCommissionAmount: Number,

  // Approval
  buyerApproved: { type: Boolean, default: false },
  sellerApproved: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },

  // Notes
  buyerNotes: String,
  sellerNotes: String,

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
dealSchema.index({ listingId: 1, status: 1 });
dealSchema.index({ buyerId: 1, status: 1 });
dealSchema.index({ sellerId: 1, status: 1 });
dealSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Deal', dealSchema);
