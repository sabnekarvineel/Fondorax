const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const ProofOfWork = require('../models/ProofOfWork');
const Marketplace = require('../models/Marketplace');

// Check admin authorization
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify user
router.put('/verify-user/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'User verified successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Verify proof of work
router.put('/verify-pow/:id', auth, requireAdmin, async (req, res) => {
  try {
    const pow = await ProofOfWork.findByIdAndUpdate(
      req.params.id,
      { verified: true, verifiedBy: req.user.userId },
      { new: true }
    );

    res.status(200).json({
      message: 'Proof of work verified',
      pow
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get transaction logs
router.get('/transactions', auth, requireAdmin, async (req, res) => {
  try {
    const transactions = await Marketplace.find()
      .populate('founderId', 'firstName lastName company email')
      .populate('interests.buyerId', 'firstName lastName email');

    res.status(200).json({ transactions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get revenue analytics
router.get('/revenue', auth, requireAdmin, async (req, res) => {
  try {
    const listings = await Marketplace.find({ status: 'completed' });
    
    const totalRevenue = listings.reduce((sum, listing) => sum + listing.transactionFee, 0);
    const completedDeals = listings.length;

    res.status(200).json({
      totalRevenue,
      completedDeals,
      listings
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
