const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Watchlist = require('../models/Watchlist');
const TrustScore = require('../models/TrustScore');
const DueDiligence = require('../models/DueDiligence');
const ProofOfWork = require('../models/ProofOfWork');
const User = require('../models/User');
const Startup = require('../models/Startup');
const trustScoreService = require('../services/trustScoreService');

// ============ WATCHLIST ENDPOINTS ============

/**
 * Add founder to watchlist
 */
router.post('/watchlist/add', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can manage watchlist' });
    }

    const { founderId, notes, priority, tags } = req.body;

    // Check if already on watchlist
    const existing = await Watchlist.findOne({
      investorId: req.user.id,
      founderId
    });

    if (existing) {
      return res.status(400).json({ message: 'Founder already on your watchlist' });
    }

    const watchlistEntry = new Watchlist({
      investorId: req.user.id,
      founderId,
      notes,
      priority: priority || 'medium',
      tags: tags || []
    });

    await watchlistEntry.save();

    res.status(201).json({
      success: true,
      message: 'Added to watchlist',
      data: watchlistEntry
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get investor's watchlist
 */
router.get('/watchlist', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view watchlist' });
    }

    const { priority, status, skip = 0, limit = 20 } = req.query;

    const query = { investorId: req.user.id };
    if (priority) query.priority = priority;
    if (status) query.dueDiligenceStatus = status;

    const watchlist = await Watchlist.find(query)
      .populate('founderId', 'firstName lastName email company bio')
      .sort({ priority: 1, addedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await Watchlist.countDocuments(query);

    // Enrich with trust scores
    const enrichedWatchlist = await Promise.all(
      watchlist.map(async (entry) => {
        const trustScore = await TrustScore.findOne({ founderId: entry.founderId });
        return {
          ...entry.toObject(),
          trustScore: trustScore || null
        };
      })
    );

    res.json({
      success: true,
      data: enrichedWatchlist,
      pagination: { total, skip: parseInt(skip), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update watchlist entry
 */
router.put('/watchlist/:watchlistId', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findById(req.params.watchlistId);

    if (!watchlist || watchlist.investorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { notes, priority, tags, investorRating, dueDiligenceStatus } = req.body;

    if (notes !== undefined) watchlist.notes = notes;
    if (priority !== undefined) watchlist.priority = priority;
    if (tags !== undefined) watchlist.tags = tags;
    if (investorRating !== undefined) watchlist.investorRating = investorRating;
    if (dueDiligenceStatus !== undefined) watchlist.dueDiligenceStatus = dueDiligenceStatus;

    watchlist.updatedAt = new Date();
    await watchlist.save();

    res.json({
      success: true,
      message: 'Watchlist updated',
      data: watchlist
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Remove from watchlist
 */
router.delete('/watchlist/:watchlistId', auth, async (req, res) => {
  try {
    const watchlist = await Watchlist.findById(req.params.watchlistId);

    if (!watchlist || watchlist.investorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Watchlist.deleteOne({ _id: req.params.watchlistId });

    res.json({
      success: true,
      message: 'Removed from watchlist'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ HIGH-SIGNAL FILTERS ENDPOINTS ============

/**
 * Get high-signal founders (execution speed 3+ features in last 30 days)
 */
router.get('/discover/high-signal', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view founders' });
    }

    const { minExecutionVelocity = 3, minTrustScore = 40, limit = 20, skip = 0 } = req.query;

    const highSignalFounders = await trustScoreService.getHighSignalFounders({
      minExecutionVelocity: parseInt(minExecutionVelocity),
      minTrustScore: parseInt(minTrustScore),
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

    res.json({
      success: true,
      data: highSignalFounders,
      message: 'Founders actively shipping features and showing strong execution'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get founders by trust score tiers
 */
router.get('/discover/by-trust-tier', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view founders' });
    }

    const tiers = {
      verified: { min: 75, max: 100 }, // 75+ score = verified, consistent execution
      active: { min: 50, max: 74 }, // 50-74 = active, building momentum
      emerging: { min: 25, max: 49 }, // 25-49 = early stage, just starting
      new: { min: 0, max: 24 } // < 25 = brand new, no track record
    };

    const results = {};

    for (const [tierName, range] of Object.entries(tiers)) {
      const trustScores = await TrustScore.find({
        overallTrustScore: { $gte: range.min, $lte: range.max }
      })
        .sort({ overallTrustScore: -1 })
        .limit(10);

      const founderData = await Promise.all(
        trustScores.map(async (ts) => {
          const founder = await User.findById(ts.founderId).select('-password');
          return { founder, trustScore: ts };
        })
      );

      results[tierName] = {
        count: founderData.length,
        scoreRange: `${range.min}-${range.max}`,
        founders: founderData
      };
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Advanced filtering by multiple signals
 */
router.post('/discover/filter', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view founders' });
    }

    const {
      minTrustScore = 0,
      minExecutionVelocity = 0,
      minConsistency = 0,
      minTransparency = 0,
      hasCustomerFeedback = false,
      hasRevenueData = false,
      limit = 20,
      skip = 0
    } = req.body;

    const query = {
      overallTrustScore: { $gte: minTrustScore },
      'metrics.featuresShippedLast30Days': { $gte: minExecutionVelocity },
      consistencyScore: { $gte: minConsistency },
      transparencyScore: { $gte: minTransparency }
    };

    let trustScores = await TrustScore.find(query)
      .sort({ overallTrustScore: -1 })
      .skip(skip)
      .limit(limit);

    // Additional filtering based on proof of work data
    if (hasCustomerFeedback || hasRevenueData) {
      const filteredIds = [];

      for (const ts of trustScores) {
        const powEntries = await ProofOfWork.find({ founderId: ts.founderId });

        let matches = true;

        if (hasCustomerFeedback) {
          matches = powEntries.some(
            p => p.customerInterview?.feedback || p.type === 'customer-interview'
          );
        }

        if (hasRevenueData && matches) {
          matches = powEntries.some(p => p.metrics?.mrr > 0 || p.metrics?.mau > 0);
        }

        if (matches) {
          filteredIds.push(ts._id);
        }
      }

      trustScores = trustScores.filter(ts => filteredIds.includes(ts._id));
    }

    // Enrich with founder data
    const results = await Promise.all(
      trustScores.map(async (ts) => {
        const founder = await User.findById(ts.founderId).select('-password');
        const powCount = await ProofOfWork.countDocuments({ founderId: ts.founderId });
        return {
          founder,
          trustScore: ts,
          proofOfWorkCount: powCount
        };
      })
    );

    res.json({
      success: true,
      data: results,
      pagination: { total: results.length, skip, limit }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ DUE DILIGENCE ENDPOINTS ============

/**
 * Create due diligence record
 */
router.post('/due-diligence/create', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can create diligence records' });
    }

    const { founderId, startupId, checklist } = req.body;

    const dueDiligence = new DueDiligence({
      investorId: req.user.id,
      founderId,
      startupId,
      checklist: checklist || [],
      status: 'in-progress'
    });

    await dueDiligence.save();

    res.status(201).json({
      success: true,
      message: 'Due diligence record created',
      data: dueDiligence
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get due diligence records for investor
 */
router.get('/due-diligence', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view diligence records' });
    }

    const { status = 'in-progress', skip = 0, limit = 20 } = req.query;

    const query = { investorId: req.user.id };
    if (status !== 'all') query.status = status;

    const records = await DueDiligence.find(query)
      .populate('founderId', 'firstName lastName email company')
      .sort({ updatedAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));

    const total = await DueDiligence.countDocuments(query);

    res.json({
      success: true,
      data: records,
      pagination: { total, skip: parseInt(skip), limit: parseInt(limit) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single due diligence record
 */
router.get('/due-diligence/:dueDiligenceId', auth, async (req, res) => {
  try {
    const record = await DueDiligence.findById(req.params.dueDiligenceId)
      .populate('founderId', 'firstName lastName email company bio')
      .populate('investorId', 'firstName lastName');

    if (!record || record.investorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Enrich with proof of work data
    const powEntries = await ProofOfWork.find({ founderId: record.founderId })
      .sort({ createdAt: -1 })
      .limit(20);

    const trustScore = await TrustScore.findOne({ founderId: record.founderId });

    res.json({
      success: true,
      data: {
        dueDiligence: record,
        trustScore,
        recentProofOfWork: powEntries
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Update due diligence record
 */
router.put('/due-diligence/:dueDiligenceId', auth, async (req, res) => {
  try {
    const record = await DueDiligence.findById(req.params.dueDiligenceId);

    if (!record || record.investorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const {
      checklist,
      teamAssessment,
      marketAssessment,
      productAssessment,
      financialAssessment,
      recommendation,
      investmentCeiling,
      investmentFloor,
      riskLevel,
      riskFactors,
      status
    } = req.body;

    if (checklist) record.checklist = checklist;
    if (teamAssessment) record.teamAssessment = teamAssessment;
    if (marketAssessment) record.marketAssessment = marketAssessment;
    if (productAssessment) record.productAssessment = productAssessment;
    if (financialAssessment) record.financialAssessment = financialAssessment;
    if (recommendation) record.recommendation = recommendation;
    if (investmentCeiling !== undefined) record.investmentCeiling = investmentCeiling;
    if (investmentFloor !== undefined) record.investmentFloor = investmentFloor;
    if (riskLevel) record.riskLevel = riskLevel;
    if (riskFactors) record.riskFactors = riskFactors;
    if (status) record.status = status;

    if (status === 'completed') {
      record.completedAt = new Date();
    }

    record.updatedAt = new Date();
    await record.save();

    res.json({
      success: true,
      message: 'Due diligence updated',
      data: record
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get founder timeline (proof of work for due diligence)
 */
router.get('/due-diligence/:dueDiligenceId/timeline', auth, async (req, res) => {
  try {
    const record = await DueDiligence.findById(req.params.dueDiligenceId);

    if (!record || record.investorId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const proofOfWork = await ProofOfWork.find({ founderId: record.founderId })
      .sort({ displayDate: -1 })
      .limit(50);

    // Organize by month
    const timeline = {};
    proofOfWork.forEach(pow => {
      const month = new Date(pow.displayDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      if (!timeline[month]) timeline[month] = [];
      timeline[month].push(pow);
    });

    res.json({
      success: true,
      data: timeline
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
