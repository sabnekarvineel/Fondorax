const mongoose = require('mongoose');

const marketplaceSchema = new mongoose.Schema({
  // Founder/Creator info
  founderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Listing details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  industry: {
    type: String,
    enum: ['SaaS', 'FinTech', 'HealthTech', 'E-commerce', 'EdTech', 'AI/ML', 'MarTech', 'Mobile App', 'Other'],
    default: 'Other'
  },
  category: {
    type: String,
    enum: ['startup_exit', 'asset_sale', 'code_sale'],
    default: 'startup_exit'
  },
  assetType: {
    type: String,
    enum: ['Equity', 'Whole Company', 'IP/Patents', 'Domain', 'SaaS Product', 'Code/Framework', 'Design System', 'Database', 'API', 'Brand/Trademark', 'Other'],
    default: 'Equity'
  },
  exitType: {
    type: String,
    enum: ['partial', 'full'],
    default: 'partial'
  },
  equityOffered: {
    type: Number,
    default: null
  },
  location: {
    type: String,
    default: null
  },
  
  // ✅ MICRO-EXIT SPECIFIC: Monthly Revenue
  monthlyRevenue: {
    type: Number,
    default: 0,
    required: true
  },
  monthlyRecurringRevenue: {
    type: Number,
    default: 0
  },
  
  // Financial metrics
  annualRevenue: {
    type: Number,
    default: 0
  },
  growthRate: {
    type: Number,
    default: 0
  },
  askingPrice: {
    type: Number,
    default: null,
    required: true
  },
  
  // ✅ AI VALUATION SCORE
  valuationScore: {
    baseValue: Number,
    growthBonus: Number,
    totalValue: Number,
    multiple: Number,
    calculatedAt: Date
  },
  
  // ✅ FOUNDER VERIFICATION
  founder: {
    name: String,
    email: String,
    linkedinUrl: String,
    verified: { type: Boolean, default: false },
    verificationDate: Date
  },
  
  // ✅ REVENUE PROOF & DOCUMENTS
  revenueProof: [{
    url: String,
    type: { type: String, enum: ['stripe', 'ga4', 'screenshot', 'bank', 'other'] },
    uploadedAt: Date,
    verified: { type: Boolean, default: false }
  }],
  
  // ✅ TECH STACK & PRODUCT INFO
  techStack: [String],
  customerCount: Number,
  churnRate: Number,
  
  // Interests (replacing old bids system)
  interests: [{
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    stage: {
      type: String,
      enum: ['interested', 'nda_pending', 'nda_signed', 'due_diligence', 'negotiating', 'closed'],
      default: 'interested'
    },
    interestedAt: {
      type: Date,
      default: Date.now
    },
    ndaSignedAt: Date,
    closedAt: Date,
    agreedPrice: Number
  }],
  
  // Listing status
  status: {
    type: String,
    enum: ['draft', 'active', 'in_negotiation', 'sold', 'closed'],
    default: 'active'
  },
  dealStatus: {
    type: String,
    enum: ['none', 'interest_received', 'nda_signed', 'due_diligence', 'negotiating', 'closed'],
    default: 'none'
  },
  
  // ✅ VERIFICATION FLAGS
  revenueVerified: { type: Boolean, default: false },
  revenueVerifiedAt: Date,
  founderVerified: { type: Boolean, default: false },
  adminApproved: { type: Boolean, default: false },
  adminApprovedAt: Date,
  
  // Admin actions
  rejectionReason: String,
  freezeReason: String,
  disputeResolution: String,
  buyerRefund: Number,
  sellerRefund: Number,
  
  // Engagement metrics
  views: { type: Number, default: 0 },
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedCount: { type: Number, default: 0 },
  interestCount: { type: Number, default: 0 },
  
  // Escrow & Payment
  escrowStatus: {
    type: String,
    enum: ['pending', 'funded', 'released', 'refunded'],
    default: 'pending'
  },
  platformCommissionPercent: { type: Number, default: 3 },
  platformCommissionAmount: Number,
  transactionId: String,
  
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

// Indexes for better query performance
marketplaceSchema.index({ status: 1, createdAt: -1 });
marketplaceSchema.index({ industry: 1 });
marketplaceSchema.index({ location: 1 });
marketplaceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Marketplace', marketplaceSchema);
