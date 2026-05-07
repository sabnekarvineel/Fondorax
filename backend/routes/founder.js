const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProofOfWork = require('../models/ProofOfWork');
const User = require('../models/User');
const ProofOfWorkAnalyzer = require('../services/proofOfWorkAnalyzer');

// Create proof of work entry
router.post('/create-pow', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can create proof of work' });
    }

    const { type, title, description, metrics, changelog, customerInterview, attachments, displayDate } = req.body;

    const pow = new ProofOfWork({
      founderId: req.user.userId,
      type,
      title,
      description,
      metrics,
      changelog,
      customerInterview,
      attachments,
      displayDate: displayDate || new Date()
    });

    pow.calculateScore();
    await pow.save();

    res.status(201).json({
      message: 'Proof of work created successfully',
      pow
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get founder's proof of work entries (live ledger)
router.get('/my-pow', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can view their proof of work' });
    }

    const powEntries = await ProofOfWork.find({ founderId: req.user.userId, isPublic: true })
      .sort({ displayDate: -1 });

    res.status(200).json({ powEntries });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get live ledger timeline (grouped by date)
router.get('/ledger-timeline', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can view their ledger' });
    }

    const powEntries = await ProofOfWork.find({ founderId: req.user.userId, isPublic: true })
      .sort({ displayDate: -1 });

    // Group by date and calculate velocity
    const timeline = {};
    powEntries.forEach(entry => {
      const dateKey = new Date(entry.displayDate).toISOString().split('T')[0];
      if (!timeline[dateKey]) {
        timeline[dateKey] = [];
      }
      timeline[dateKey].push(entry.getTimelineMetadata());
    });

    res.status(200).json({ timeline });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get execution metrics dashboard
router.get('/metrics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can view their metrics' });
    }

    const powEntries = await ProofOfWork.find({ founderId: req.user.userId });

    const avgExecutionScore = powEntries.length > 0
      ? (powEntries.reduce((sum, pow) => sum + pow.executionScore, 0) / powEntries.length).toFixed(2)
      : 0;

    const avgTransparencyScore = powEntries.length > 0
      ? (powEntries.reduce((sum, pow) => sum + pow.transparencyScore, 0) / powEntries.length).toFixed(2)
      : 0;

    const avgVelocityScore = powEntries.length > 0
      ? (powEntries.reduce((sum, pow) => sum + pow.velocityScore, 0) / powEntries.length).toFixed(2)
      : 0;

    // Count entry types
    const entriesByType = {};
    powEntries.forEach(entry => {
      entriesByType[entry.type] = (entriesByType[entry.type] || 0) + 1;
    });

    // Get recent customer interviews
    const customerInterviews = powEntries.filter(e => e.type === 'customer-interview');
    const avgNPS = customerInterviews.length > 0
      ? (customerInterviews.reduce((sum, e) => sum + (e.metrics.nps || 0), 0) / customerInterviews.length).toFixed(1)
      : 0;

    // Calculate posting frequency (per week)
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const recentEntries = powEntries.filter(e => new Date(e.displayDate) > twoWeeksAgo);
    const postingFrequency = (recentEntries.length / 2).toFixed(1);

    res.status(200).json({
      scores: {
        execution: avgExecutionScore,
        transparency: avgTransparencyScore,
        velocity: avgVelocityScore
      },
      entriesByType,
      customerInterviews: customerInterviews.length,
      averageNPS: avgNPS,
      postingFrequency,
      totalEntries: powEntries.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get founder profile with enhanced metrics
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    const powEntries = await ProofOfWork.find({ founderId: req.user.userId });
    
    const executionScore = powEntries.length > 0 
      ? (powEntries.reduce((sum, pow) => sum + pow.executionScore, 0) / powEntries.length).toFixed(2)
      : 0;

    const transparencyScore = powEntries.length > 0
      ? (powEntries.reduce((sum, pow) => sum + pow.transparencyScore, 0) / powEntries.length).toFixed(2)
      : 0;

    res.status(200).json({
      profile: user,
      scores: {
        execution: executionScore,
        transparency: transparencyScore
      },
      totalEntries: powEntries.length,
      verified: user.verified || false
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update founder profile
router.put('/profile', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can update their profile' });
    }

    const { company, bio, phone, location } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { company, bio, phone, location },
      { new: true }
    ).select('-password');

    res.status(200).json({
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Update proof of work entry
router.put('/pow/:id', auth, async (req, res) => {
  try {
    const pow = await ProofOfWork.findById(req.params.id);
    
    if (!pow || pow.founderId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    const { title, description, metrics, changelog, customerInterview, attachments, isPublic } = req.body;
    
    Object.assign(pow, {
      title: title || pow.title,
      description: description || pow.description,
      metrics: metrics || pow.metrics,
      changelog: changelog || pow.changelog,
      customerInterview: customerInterview || pow.customerInterview,
      attachments: attachments || pow.attachments,
      isPublic: isPublic !== undefined ? isPublic : pow.isPublic
    });

    pow.calculateScore();
    await pow.save();

    res.status(200).json({
      message: 'Entry updated successfully',
      pow
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete proof of work entry
router.delete('/pow/:id', auth, async (req, res) => {
  try {
    const pow = await ProofOfWork.findById(req.params.id);
    
    if (!pow || pow.founderId.toString() !== req.user.userId) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    await ProofOfWork.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUBLIC ROUTES FOR INVESTORS

// Get founder's proof of work summary (for investors)
router.get('/:founderId/pow-summary', async (req, res) => {
  try {
    const summary = await ProofOfWorkAnalyzer.generateInvestorSummary(req.params.founderId);
    res.status(200).json(summary);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get founder's public proof of work entries (for investors)
router.get('/:founderId/pow-entries', async (req, res) => {
  try {
    const entries = await ProofOfWork.find({
      founderId: req.params.founderId,
      isPublic: true
    }).sort({ displayDate: -1 });

    res.status(200).json({ entries });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get founder's execution metrics (for investors)
router.get('/:founderId/execution-metrics', async (req, res) => {
  try {
    const velocity = await ProofOfWorkAnalyzer.calculateVelocity(req.params.founderId);
    const transparency = await ProofOfWorkAnalyzer.calculateTransparency(req.params.founderId);
    const metrics = await ProofOfWorkAnalyzer.getCompetitiveMetrics(req.params.founderId);

    res.status(200).json({
      velocity,
      transparency,
      ...metrics
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
