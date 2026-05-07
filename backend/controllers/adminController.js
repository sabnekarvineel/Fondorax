const User = require('../models/User');
const Admin = require('../models/Admin');
const AdminLog = require('../models/AdminLog');
const Marketplace = require('../models/Marketplace');
const PitchDeck = require('../models/PitchDeck');
const Portfolio = require('../models/Portfolio');
const Resource = require('../models/Resource');
const ProofOfWork = require('../models/ProofOfWork');

// Log admin actions
const logAction = async (adminId, action, targetUser, targetModel, targetId, details, req) => {
  try {
    await AdminLog.create({
      adminId,
      action,
      targetUser,
      targetModel,
      targetId,
      details,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });
  } catch (err) {
    console.error('Error logging admin action:', err.message);
  }
};

// ===== USER & ACCESS MANAGEMENT =====

// Get all users with filters
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, kycStatus, page = 1, limit = 10 } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.verified = status === 'verified';
    if (kycStatus) query.kycStatus = kycStatus;

    const users = await User.find(query)
      .select('-password -twoFactorSecret')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await User.countDocuments(query);

    res.status(200).json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};

// Get single user details
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -twoFactorSecret')
      .populate('approvedBy', 'firstName lastName email')
      .populate('suspendedBy', 'firstName lastName email');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching user', error: err.message });
  }
};

// Approve founder registration
exports.approveFounder = async (req, res) => {
  try {
    const { id } = req.params;
    const { approvalNotes } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        approvedBy: req.user.userId,
        approvalDate: new Date(),
        verified: true
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(
      req.user.userId,
      'approve_founder',
      id,
      'User',
      id,
      { approvalNotes },
      req
    );

    res.status(200).json({ message: 'Founder approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error approving founder', error: err.message });
  }
};

// Reject founder registration
exports.rejectFounder = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'rejected',
        rejectionReason
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(
      req.user.userId,
      'reject_founder',
      id,
      'User',
      id,
      { rejectionReason },
      req
    );

    res.status(200).json({ message: 'Founder rejected', user });
  } catch (err) {
    res.status(500).json({ message: 'Error rejecting founder', error: err.message });
  }
};

// Approve investor account
exports.approveInvestor = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        approvalStatus: 'approved',
        approvedBy: req.user.userId,
        approvalDate: new Date(),
        verified: true
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(req.user.userId, 'approve_investor', id, 'User', id, {}, req);

    res.status(200).json({ message: 'Investor approved successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error approving investor', error: err.message });
  }
};

// Suspend/Block account
exports.suspendAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        suspended: true,
        suspensionReason: reason,
        suspendedAt: new Date(),
        suspendedBy: req.user.userId
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(req.user.userId, 'suspend_user', id, 'User', id, { reason }, req);

    res.status(200).json({ message: 'User suspended successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error suspending user', error: err.message });
  }
};

// Unsuspend account
exports.unsuspendAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      {
        suspended: false,
        suspensionReason: null,
        suspendedAt: null,
        suspendedBy: null
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(req.user.userId, 'unsuspend_user', id, 'User', id, {}, req);

    res.status(200).json({ message: 'User unsuspended successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Error unsuspending user', error: err.message });
  }
};

// Reset user password
exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    await logAction(req.user.userId, 'reset_password', id, 'User', id, {}, req);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
};

// Manage KYC verification
exports.updateKYCStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, document } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        kycStatus: status,
        kycDocument: document || user.kycDocument
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(req.user.userId, 'update_kyc_status', id, 'User', id, { status }, req);

    res.status(200).json({ message: 'KYC status updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Error updating KYC status', error: err.message });
  }
};

// Flag user for review
exports.flagUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      {
        flaggedForReview: true,
        flagReason: reason
      },
      { new: true }
    ).select('-password -twoFactorSecret');

    await logAction(req.user.userId, 'flag_user', id, 'User', id, { reason }, req);

    res.status(200).json({ message: 'User flagged for review', user });
  } catch (err) {
    res.status(500).json({ message: 'Error flagging user', error: err.message });
  }
};

// ===== MARKETPLACE ADMINISTRATION =====

// Get all marketplace listings
exports.getAllListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    let query = {};

    if (status) query.status = status;

    const listings = await Marketplace.find(query)
      .populate('founderId', 'firstName lastName company email')
      .populate('interests.buyerId', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Marketplace.countDocuments(query);

    res.status(200).json({
      listings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching listings', error: err.message });
  }
};

// Approve listing
exports.approveListing = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Marketplace.findByIdAndUpdate(
      id,
      { status: 'active', adminApproved: true, adminApprovedAt: new Date() },
      { new: true, runValidators: false }
    ).populate('founderId', 'firstName lastName email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const founderIdValue = listing.founderId?._id || listing.founderId;
    await logAction(req.user.userId, 'approve_listing', founderIdValue, 'Marketplace', id, {}, req);

    res.status(200).json({ message: 'Listing approved', listing });
  } catch (err) {
    console.error('Approve listing error:', err);
    res.status(500).json({ message: 'Error approving listing', error: err.message });
  }
};

// Reject listing
exports.rejectListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Marketplace.findByIdAndUpdate(
      id,
      { status: 'closed', rejectionReason: reason },
      { new: true, runValidators: false }
    ).populate('founderId', 'firstName lastName email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const founderIdValue = listing.founderId?._id || listing.founderId;
    await logAction(req.user.userId, 'reject_listing', founderIdValue, 'Marketplace', id, { reason }, req);

    res.status(200).json({ message: 'Listing rejected', listing });
  } catch (err) {
    console.error('Reject listing error:', err);
    res.status(500).json({ message: 'Error rejecting listing', error: err.message });
  }
};

// Freeze listing
exports.freezeListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate input
    if (!id) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Marketplace.findByIdAndUpdate(
      id,
      { status: 'closed', freezeReason: reason },
      { new: true, runValidators: false }
    ).populate('founderId', 'firstName lastName email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Extract founderId - handle both populated and unpopulated cases
    const founderIdValue = listing.founderId?._id || listing.founderId;
    
    await logAction(req.user.userId, 'freeze_listing', founderIdValue, 'Marketplace', id, { reason }, req);

    res.status(200).json({ message: 'Listing frozen', listing });
  } catch (err) {
    console.error('Freeze listing error:', err);
    res.status(500).json({ message: 'Error freezing listing', error: err.message });
  }
};

// Handle disputes
exports.handleDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, buyerRefund, sellerRefund } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Listing ID is required' });
    }

    const listing = await Marketplace.findByIdAndUpdate(
      id,
      {
        disputeResolution: resolution,
        buyerRefund,
        sellerRefund,
        status: 'closed'
      },
      { new: true, runValidators: false }
    ).populate('founderId', 'firstName lastName email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const founderIdValue = listing.founderId?._id || listing.founderId;
    await logAction(req.user.userId, 'handle_dispute', founderIdValue, 'Marketplace', id, { resolution }, req);

    res.status(200).json({ message: 'Dispute resolved', listing });
  } catch (err) {
    console.error('Handle dispute error:', err);
    res.status(500).json({ message: 'Error handling dispute', error: err.message });
  }
};

// ===== ANALYTICS DASHBOARD =====

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFounders = await User.countDocuments({ role: 'founder' });
    const totalInvestors = await User.countDocuments({ role: 'investor' });
    const verifiedUsers = await User.countDocuments({ verified: true });

    const activeListings = await Marketplace.countDocuments({ status: 'active' });
    const totalListings = await Marketplace.countDocuments();

    const completedDeals = await Marketplace.countDocuments({ status: 'completed' });
    const totalInvestments = await Marketplace.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$buyPrice' } } }
    ]);

    const revenue = await Marketplace.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$transactionFee' } } }
    ]);

    const pendingApprovals = await User.countDocuments({ approvalStatus: 'pending' });
    const flaggedAccounts = await User.countDocuments({ flaggedForReview: true });

    res.status(200).json({
      users: {
        total: totalUsers,
        founders: totalFounders,
        investors: totalInvestors,
        verified: verifiedUsers
      },
      marketplace: {
        activeListings,
        totalListings,
        completedDeals
      },
      investments: {
        total: totalInvestments[0]?.total || 0,
        averageDeal: completedDeals > 0 ? (totalInvestments[0]?.total || 0) / completedDeals : 0
      },
      revenue: {
        total: revenue[0]?.total || 0
      },
      pending: {
        approvals: pendingApprovals,
        flagged: flaggedAccounts
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: err.message });
  }
};

// ===== AUDIT & LOGGING =====

exports.getAdminLogs = async (req, res) => {
  try {
    const { adminId, action, page = 1, limit = 10, startDate, endDate } = req.query;
    let query = {};

    if (adminId) query.adminId = adminId;
    if (action) query.action = action;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const logs = await AdminLog.find(query)
      .populate('adminId', 'firstName lastName email')
      .populate('targetUser', 'firstName lastName email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await AdminLog.countDocuments(query);

    res.status(200).json({
      logs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching logs', error: err.message });
  }
};

// ===== ADMIN MANAGEMENT =====

exports.assignAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminLevel, department, permissions } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Create or update admin record
    let admin = await Admin.findOne({ userId });
    if (!admin) {
      admin = new Admin({
        userId,
        adminLevel,
        department,
        permissions,
        assignedBy: req.user.userId
      });
    } else {
      admin.adminLevel = adminLevel;
      admin.department = department;
      admin.permissions = permissions;
    }

    await admin.save();

    // Update user role
    user.role = 'admin';
    await user.save();

    res.status(200).json({ message: 'Admin role assigned', admin });
  } catch (err) {
    res.status(500).json({ message: 'Error assigning admin role', error: err.message });
  }
};

exports.getAdminList = async (req, res) => {
  try {
    const admins = await Admin.find()
      .populate('userId', 'firstName lastName email role')
      .populate('assignedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ admins });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching admins', error: err.message });
  }
};

exports.removeAdminRole = async (req, res) => {
  try {
    const { userId } = req.params;

    await Admin.findOneAndDelete({ userId });
    
    // Revert user role to founder
    await User.findByIdAndUpdate(userId, { role: 'founder' });

    res.status(200).json({ message: 'Admin role removed' });
  } catch (err) {
    res.status(500).json({ message: 'Error removing admin role', error: err.message });
  }
};

module.exports = exports;
