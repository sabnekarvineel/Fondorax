const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ProofOfWork = require('../models/ProofOfWork');
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Marketplace = require('../models/Marketplace');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get all founders for investment
router.get('/founders', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view founders' });
    }

    const founders = await User.find({ role: 'founder' }).select('-password');

    // Enrich with execution scores
    const foundersWithScores = await Promise.all(
      founders.map(async (founder) => {
        const powEntries = await ProofOfWork.find({ founderId: founder._id });
        const executionScore = powEntries.length > 0
          ? (powEntries.reduce((sum, pow) => sum + pow.executionScore, 0) / powEntries.length).toFixed(2)
          : 0;

        return {
          ...founder.toObject(),
          executionScore,
          totalEntries: powEntries.length
        };
      })
    );

    res.status(200).json({ founders: foundersWithScores });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// View founder details
router.get('/founder/:id', auth, async (req, res) => {
  try {
    const founder = await User.findById(req.params.id).select('-password');
    if (!founder || founder.role !== 'founder') {
      return res.status(404).json({ message: 'Founder not found' });
    }

    const powEntries = await ProofOfWork.find({ founderId: req.params.id })
      .sort({ createdAt: -1 });

    const executionScore = powEntries.length > 0
      ? (powEntries.reduce((sum, pow) => sum + pow.executionScore, 0) / powEntries.length).toFixed(2)
      : 0;

    res.status(200).json({
      founder,
      powEntries,
      executionScore,
      totalEntries: powEntries.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all pitch analyses (investor view)
router.get('/pitch-analyses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view pitch analyses' });
    }

    const { limit = 20, skip = 0, minScore = 60 } = req.query;

    const analyses = await prisma.pitchAnalysis.findMany({
      where: {
        totalScore: { gte: parseInt(minScore) }
      },
      include: { startup: true },
      orderBy: { totalScore: 'desc' },
      take: parseInt(limit),
      skip: parseInt(skip)
    });

    const total = await prisma.pitchAnalysis.count({
      where: { totalScore: { gte: parseInt(minScore) } }
    });

    res.json({
      success: true,
      data: analyses,
      pagination: { total, limit: parseInt(limit), skip: parseInt(skip) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single pitch analysis
router.get('/pitch-analysis/:analysisId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view pitch analyses' });
    }

    const analysis = await prisma.pitchAnalysis.findUnique({
      where: { id: parseInt(req.params.analysisId) },
      include: { startup: true }
    });

    if (!analysis) {
      return res.status(404).json({ success: false, message: 'Analysis not found' });
    }

    const metrics = await prisma.financialMetrics.findFirst({
      where: { startupId: analysis.startupId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: { analysis, metrics }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get top startups by pitch score
router.get('/top-startups', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view top startups' });
    }

    const { limit = 20, minScore = 70, industry, stage } = req.query;

    const topStartups = await prisma.pitchAnalysis.findMany({
      where: {
        totalScore: { gte: parseInt(minScore) },
        startup: {
          ...(industry && { industry }),
          ...(stage && { stage })
        }
      },
      include: { startup: true },
      orderBy: { totalScore: 'desc' },
      take: parseInt(limit)
    });

    res.json({
      success: true,
      data: topStartups,
      count: topStartups.length
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get pitch analysis dashboard stats
router.get('/pitch-dashboard-stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view dashboard' });
    }

    const totalAnalyses = await prisma.pitchAnalysis.count();
    
    const riskDistribution = await prisma.pitchAnalysis.groupBy({
      by: ['riskLevel'],
      _count: true
    });

    const avgScore = await prisma.pitchAnalysis.aggregate({
      _avg: { totalScore: true }
    });

    const topStartups = await prisma.pitchAnalysis.findMany({
      include: { startup: true },
      orderBy: { totalScore: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        totalAnalyses,
        avgScore: avgScore._avg.totalScore?.toFixed(2) || 0,
        riskDistribution,
        topStartups
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get investor portfolio
router.get('/portfolio', auth, async (req, res) => {
  try {
    if (req.user.role !== 'investor') {
      return res.status(403).json({ message: 'Only investors can view portfolio' });
    }

    // Get investments for this investor from database
    // For now, return structured empty response matching frontend expectations
    const investments = [];
    const totalInvestment = 0;
    const portfolioValue = 0;
    const roiPercentage = 0;
    const diversificationScore = 0;

    // Calculate risk metrics
    const highRiskCount = 0;
    const mediumRiskCount = 0;
    const lowRiskCount = 0;

    res.json({
      success: true,
      portfolio: {
        investments: investments,
        analytics: {
          totalInvestment,
          portfolioValue,
          roiPercentage,
          diversificationScore
        },
        riskMetrics: {
          highRiskCount,
          mediumRiskCount,
          lowRiskCount
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
