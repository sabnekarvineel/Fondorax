const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fondorax', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB connected');

    // Check if admin exists
    const adminEmail = 'admin@foundorax.com';
    
    // First, try to find existing user
    let adminUser = await User.findOne({ email: adminEmail });
    console.log('🔍 Checking for existing user:', adminEmail);

    if (!adminUser) {
      console.log('📝 Creating new admin user...');
      // Create admin user
      adminUser = new User({
        firstName: 'Admin',
        lastName: 'Fondorax',
        email: adminEmail,
        password: 'Admin@123456',
        role: 'admin',
        verified: true,
        approvalStatus: 'approved',
        kycStatus: 'verified'
      });

      const saved = await adminUser.save();
      console.log('✅ Admin user CREATED:', adminEmail);
      console.log('✅ User ID:', saved._id);
    } else {
      console.log('📝 Updating existing user to admin...');
      // Update existing user to admin
      adminUser.role = 'admin';
      adminUser.verified = true;
      adminUser.approvalStatus = 'approved';
      adminUser.kycStatus = 'verified';
      const updated = await adminUser.save();
      console.log('✅ User UPDATED to admin:', adminEmail);
      console.log('✅ User ID:', updated._id);
    }
    
    // Verify user was actually created/updated
    const verifyUser = await User.findOne({ email: adminEmail });
    if (verifyUser) {
      console.log('✅ VERIFIED: Admin user exists in database');
      console.log('   Email:', verifyUser.email);
      console.log('   Role:', verifyUser.role);
    } else {
      console.log('❌ ERROR: Admin user NOT found in database after save!');
    }

    // Create/Update Admin record with Super Admin level
    let admin = await Admin.findOne({ userId: adminUser._id });
    if (!admin) {
      admin = new Admin({
        userId: adminUser._id,
        adminLevel: 'super_admin',
        department: 'user_management',
        permissions: [
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
        ],
        active: true
      });

      await admin.save();
      console.log('✅ Super Admin record created');
    } else {
      console.log('✅ Super Admin record already exists');
    }

    console.log('\n🎉 Admin setup complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin Email:', adminEmail);
    console.log('Admin Password: Admin@123456');
    console.log('Admin Level: Super Admin (Full Access)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
