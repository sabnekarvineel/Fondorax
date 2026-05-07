const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  adminLevel: {
    type: String,
    enum: ['super_admin', 'financial_admin', 'marketplace_moderator', 'content_admin', 'technical_admin'],
    default: 'super_admin'
  },
  permissions: [{
    type: String,
    enum: [
      // User Management
      'manage_users',
      'approve_founders',
      'approve_investors',
      'suspend_accounts',
      'reset_passwords',
      'manage_kyc',
      'monitor_activity',
      // Marketplace
      'approve_listings',
      'verify_financials',
      'monitor_transactions',
      'handle_disputes',
      'set_commission',
      'freeze_listings',
      // Pitch Analysis
      'manage_ai_models',
      'define_scoring',
      'configure_reports',
      'monitor_usage',
      'flag_submissions',
      // Portfolio
      'view_portfolios',
      'monitor_performance',
      'detect_patterns',
      'manage_benchmarks',
      // Content
      'manage_schemes',
      'manage_resources',
      'manage_blogs',
      'moderate_comments',
      // Financial
      'set_commission_rates',
      'view_revenue',
      'manage_invoices',
      'approve_payouts',
      // Security
      'manage_2fa',
      'manage_encryption',
      'export_audit_logs',
      'handle_gdpr',
      'backup_restore'
    ]
  }],
  department: {
    type: String,
    enum: ['user_management', 'marketplace', 'ai_analysis', 'portfolio', 'content', 'finance', 'security', 'support'],
    default: 'user_management'
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  active: {
    type: Boolean,
    default: true
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

module.exports = mongoose.model('Admin', adminSchema);
