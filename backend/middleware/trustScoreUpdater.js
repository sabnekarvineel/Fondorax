const trustScoreService = require('../services/trustScoreService');

/**
 * Middleware to recalculate trust score after proof of work operations
 */
async function updateTrustScoreOnProofOfWorkChange(req, res, next) {
  // Store the original res.json to intercept successful responses
  const originalJson = res.json;

  res.json = async function(data) {
    // If this was a successful proof of work creation/update
    if (res.statusCode < 400 && data.success && data.data?.founderId) {
      try {
        // Recalculate trust score
        await trustScoreService.calculateTrustScore(data.data.founderId);
      } catch (error) {
        console.error('Error updating trust score:', error);
        // Don't fail the response, just log the error
      }
    }

    // Call original json with the data
    return originalJson.call(this, data);
  };

  next();
}

/**
 * Manually trigger trust score calculation
 */
async function recalculateTrustScores() {
  try {
    const ProofOfWork = require('../models/ProofOfWork');
    const User = require('../models/User');

    // Get all founders with proof of work
    const founders = await User.find({ role: 'founder' });

    for (const founder of founders) {
      const hasProof = await ProofOfWork.findOne({ founderId: founder._id });
      if (hasProof) {
        await trustScoreService.calculateTrustScore(founder._id);
      }
    }

    console.log('Trust scores recalculated for all founders');
  } catch (error) {
    console.error('Error recalculating trust scores:', error);
  }
}

module.exports = {
  updateTrustScoreOnProofOfWorkChange,
  recalculateTrustScores
};
