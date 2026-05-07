const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PitchAnalysisService = require('../services/pitchAnalysisService');

/**
 * PITCH DECK ANALYSIS ENDPOINTS
 */

/**
 * Analyze pitch deck with AI
 * POST /api/analysis/pitch
 * Body: { companyName, founder, market, product, traction, finance }
 */
router.post('/pitch', auth, async (req, res) => {
  try {
    const pitchData = {
      companyName: req.body.companyName,
      founder: req.body.founder || {},
      market: req.body.market || {},
      product: req.body.product || {},
      traction: req.body.traction || {},
      finance: req.body.finance || {}
    };

    const analysis = PitchAnalysisService.analyzePitch(pitchData);

    res.status(200).json({
      success: true,
      message: 'Pitch analysis completed successfully',
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing pitch',
      error: error.message
    });
  }
});

/**
 * Analyze pitch from PDF (placeholder for future AI integration)
 * POST /api/analysis/pitch-pdf
 */
router.post('/pitch-pdf', auth, async (req, res) => {
  try {
    // TODO: Implement PDF parsing with free OCR/AI
    // For now, accept structured data
    const pitchData = req.body;
    const analysis = PitchAnalysisService.analyzePitch(pitchData);

    res.status(200).json({
      success: true,
      message: 'PDF pitch analysis completed',
      analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing PDF',
      error: error.message
    });
  }
});

/**
 * Get pitch analysis report
 * GET /api/analysis/pitch/:id
 */
router.get('/pitch/:id', auth, async (req, res) => {
  try {
    // TODO: Fetch from database
    res.status(200).json({
      message: 'Fetch pitch analysis by ID'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving analysis',
      error: error.message
    });
  }
});

/**
 * Get comparison of multiple pitches
 * POST /api/analysis/pitch-compare
 */
router.post('/pitch-compare', auth, async (req, res) => {
  try {
    const pitches = req.body.pitches || [];
    const analyses = pitches.map(pitch => PitchAnalysisService.analyzePitch(pitch));

    // Sort by overall score
    analyses.sort((a, b) => b.overallScore - a.overallScore);

    res.status(200).json({
      success: true,
      message: 'Pitch comparison completed',
      analyses,
      topCandidate: analyses[0],
      recommendation: this.generateComparisonRecommendation(analyses)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error comparing pitches',
      error: error.message
    });
  }
});



module.exports = router;
