const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      // User Management
      'approve_founder',
      'reject_founder',
      'approve_investor',
      'reject_investor',
      'suspend_user',
      'unsuspend_user',
      'reset_password',
      'update_kyc_status',
      'verify_user',
      // Marketplace
      'approve_listing',
      'reject_listing',
      'freeze_listing',
      'unfreeze_listing',
      'handle_dispute',
      'update_commission',
      // Pitch Analysis
      'update_ai_model',
      'update_scoring_parameters',
      'flag_pitch',
      'unflag_pitch',
      // Portfolio
      'view_portfolio',
      'flag_unusual_activity',
      // Content
      'create_scheme',
      'update_scheme',
      'delete_scheme',
      'create_blog',
      'update_blog',
      'delete_blog',
      'moderate_comment',
      // Security
      'enable_2fa',
      'export_logs',
      'backup_database',
      'update_encryption',
      // Financial
      'approve_payout',
      'reject_payout',
      'generate_invoice',
      'view_revenue'
    ]
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetModel: {
    type: String,
    enum: ['User', 'Marketplace', 'PitchDeck', 'Portfolio', 'Resource', 'ProofOfWork']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  details: {
    type: Object,
    default: {}
  },
  status: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success'
  },
  ipAddress: String,
  userAgent: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('AdminLog', adminLogSchema);
