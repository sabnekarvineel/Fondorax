const TrustScore = require('../models/TrustScore');
const ProofOfWork = require('../models/ProofOfWork');
const User = require('../models/User');

class TrustScoreService {
  /**
   * Calculate trust score for a founder based on their Proof of Work entries
   */
  async calculateTrustScore(founderId) {
    try {
      const proofOfWorkEntries = await ProofOfWork.find({ founderId })
        .sort({ createdAt: -1 });

      if (proofOfWorkEntries.length === 0) {
        return this._createDefaultTrustScore(founderId);
      }

      // Calculate metrics
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

      // Velocity Score: Based on update frequency
      const updatesLast7Days = proofOfWorkEntries.filter(
        p => new Date(p.createdAt) >= last7Days
      ).length;
      const updatesLast30Days = proofOfWorkEntries.filter(
        p => new Date(p.createdAt) >= last30Days
      ).length;
      const updatesLast90Days = proofOfWorkEntries.filter(
        p => new Date(p.createdAt) >= last90Days
      ).length;

      const velocityScore = Math.min(
        100,
        (updatesLast30Days / 4) * 100 // Expect ~4 updates per month = 100%
      );

      // Consistency Score: Based on streak and regularity
      const consistencyScore = this._calculateConsistencyScore(proofOfWorkEntries);

      // Transparency Score: Based on data quality
      const transparencyScore = this._calculateTransparencyScore(proofOfWorkEntries);

      // Execution Score: Based on shipped features and iterations
      const executionScore = this._calculateExecutionScore(proofOfWorkEntries);

      // Find or create trust score document
      let trustScore = await TrustScore.findOne({ founderId });

      if (!trustScore) {
        trustScore = new TrustScore({ founderId });
      }

      // Update metrics
      trustScore.metrics = {
        updatesLast7Days,
        updatesLast30Days,
        updatesLast90Days,
        totalProofOfWorkEntries: proofOfWorkEntries.length,
        verifiedEntries: proofOfWorkEntries.filter(p => p.verified).length,
        entriesWithMetrics: proofOfWorkEntries.filter(p => p.metrics && Object.values(p.metrics).some(v => v > 0)).length,
        entriesWithCustomerFeedback: proofOfWorkEntries.filter(
          p => p.customerInterview?.feedback || p.type === 'customer-interview'
        ).length,
        featuresShippedLast30Days: proofOfWorkEntries
          .filter(p => new Date(p.createdAt) >= last30Days && p.type === 'product-changelog')
          .reduce((sum, p) => sum + (p.changelog?.features?.length || 0), 0),
        bugsFixedLast30Days: proofOfWorkEntries
          .filter(p => new Date(p.createdAt) >= last30Days && p.type === 'product-changelog')
          .reduce((sum, p) => sum + (p.changelog?.bugFixes?.length || 0), 0),
        customerInterviewsLast30Days: proofOfWorkEntries
          .filter(p => new Date(p.createdAt) >= last30Days && p.type === 'customer-interview').length,
        lastUpdateDate: proofOfWorkEntries[0]?.createdAt || new Date(),
        currentStreak: this._calculateCurrentStreak(proofOfWorkEntries),
        longestStreak: this._calculateLongestStreak(proofOfWorkEntries)
      };

      // Update scores
      trustScore.velocityScore = velocityScore;
      trustScore.consistencyScore = consistencyScore;
      trustScore.transparencyScore = transparencyScore;
      trustScore.executionScore = executionScore;

      // Calculate overall trust score
      trustScore.calculateTrustScore();

      // Record history
      trustScore.recordHistory();

      // Check and assign milestones
      this._checkMilestones(trustScore);

      trustScore.lastCalculatedAt = new Date();
      await trustScore.save();

      return trustScore;
    } catch (error) {
      console.error('Error calculating trust score:', error);
      throw error;
    }
  }

  /**
   * Calculate consistency score based on update regularity
   */
  _calculateConsistencyScore(proofOfWorkEntries) {
    if (proofOfWorkEntries.length === 0) return 0;

    // Analyze gaps between updates
    const sortedEntries = [...proofOfWorkEntries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    let gaps = [];
    for (let i = 0; i < sortedEntries.length - 1; i++) {
      const gap = (new Date(sortedEntries[i].createdAt) - new Date(sortedEntries[i + 1].createdAt)) / (1000 * 60 * 60 * 24);
      gaps.push(gap);
    }

    // Calculate average gap (ideal is 7 days)
    const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b) / gaps.length : 0;
    const consistencyVariance = Math.sqrt(
      gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / Math.max(gaps.length, 1)
    );

    // Score based on frequency and variance
    const frequencyScore = Math.max(0, 100 - (avgGap / 14) * 100); // -5% per extra day from 7-day ideal
    const stabilityScore = Math.max(0, 100 - (consistencyVariance / 5) * 10); // Lower variance = higher score

    return Math.round((frequencyScore * 0.6 + stabilityScore * 0.4));
  }

  /**
   * Calculate transparency score based on data quality
   */
  _calculateTransparencyScore(proofOfWorkEntries) {
    if (proofOfWorkEntries.length === 0) return 0;

    let transparencyPoints = 0;
    let maxPoints = 0;

    proofOfWorkEntries.forEach(entry => {
      maxPoints += 100;

      // Award points for having verified entries
      if (entry.verified) transparencyPoints += 20;

      // Award points for customer feedback
      if (entry.customerInterview?.feedback || entry.type === 'customer-interview') {
        transparencyPoints += 25;
      }

      // Award points for revenue/metrics data
      if (entry.metrics?.mrr > 0 || entry.metrics?.mau > 0) {
        transparencyPoints += 25;
      }

      // Award points for attachments (videos, documents)
      if (entry.attachments && entry.attachments.length > 0) {
        transparencyPoints += 15;
      }

      // Award points for detailed descriptions
      if (entry.description && entry.description.length > 200) {
        transparencyPoints += 15;
      }
    });

    return Math.min(100, Math.round((transparencyPoints / maxPoints) * 100));
  }

  /**
   * Calculate execution score based on shipped features and iterations
   */
  _calculateExecutionScore(proofOfWorkEntries) {
    if (proofOfWorkEntries.length === 0) return 0;

    let executionPoints = 0;
    let maxPoints = 0;

    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    proofOfWorkEntries.forEach(entry => {
      maxPoints += 100;

      // Bonus for recent activity
      if (new Date(entry.createdAt) >= last30Days) {
        executionPoints += 10;
      }

      // Points for shipped features
      if (entry.changelog?.features?.length > 0) {
        executionPoints += Math.min(20, entry.changelog.features.length * 3);
      }

      // Points for bug fixes
      if (entry.changelog?.bugFixes?.length > 0) {
        executionPoints += Math.min(15, entry.changelog.bugFixes.length * 2);
      }

      // Points for iterations (frequency of updates shows execution)
      executionPoints += 10;

      // Points for customer feedback implementation
      if (entry.type === 'iteration') {
        executionPoints += 20;
      }

      // High NPS indicates good execution
      if (entry.metrics?.nps > 50) {
        executionPoints += 15;
      }
    });

    return Math.min(100, Math.round((executionPoints / maxPoints) * 100));
  }

  /**
   * Calculate current update streak in days
   */
  _calculateCurrentStreak(proofOfWorkEntries) {
    if (proofOfWorkEntries.length === 0) return 0;

    const sortedEntries = [...proofOfWorkEntries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    let streak = 0;
    let lastDate = new Date(sortedEntries[0].createdAt);

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i].createdAt);
      const daysDiff = (lastDate - currentDate) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 14) { // Allow up to 2 weeks gap
        streak += daysDiff;
      } else {
        break;
      }

      lastDate = currentDate;
    }

    return Math.round(streak);
  }

  /**
   * Calculate longest streak in days
   */
  _calculateLongestStreak(proofOfWorkEntries) {
    if (proofOfWorkEntries.length === 0) return 0;

    const sortedEntries = [...proofOfWorkEntries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    let maxStreak = 0;
    let currentStreak = 0;
    let lastDate = new Date(sortedEntries[0].createdAt);

    for (let i = 1; i < sortedEntries.length; i++) {
      const currentDate = new Date(sortedEntries[i].createdAt);
      const daysDiff = (lastDate - currentDate) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 14) {
        currentStreak += daysDiff;
      } else {
        maxStreak = Math.max(maxStreak, currentStreak);
        currentStreak = 0;
      }

      lastDate = currentDate;
    }

    return Math.round(Math.max(maxStreak, currentStreak));
  }

  /**
   * Check and assign milestones
   */
  _checkMilestones(trustScore) {
    const existingMilestones = trustScore.milestones.map(m => m.type);

    // First update milestone
    if (!existingMilestones.includes('first-update') && trustScore.metrics.totalProofOfWorkEntries > 0) {
      trustScore.milestones.push({
        type: 'first-update',
        achievedAt: new Date(trustScore.metrics.lastUpdateDate),
        details: { entryCount: trustScore.metrics.totalProofOfWorkEntries }
      });
    }

    // 7-day streak milestone
    if (!existingMilestones.includes('7-day-streak') && trustScore.metrics.currentStreak >= 7) {
      trustScore.milestones.push({
        type: '7-day-streak',
        achievedAt: new Date(),
        details: { streakDays: trustScore.metrics.currentStreak }
      });
    }

    // 30-day active milestone
    if (!existingMilestones.includes('30-day-active') && trustScore.metrics.updatesLast30Days >= 4) {
      trustScore.milestones.push({
        type: '30-day-active',
        achievedAt: new Date(),
        details: { updatesInLast30Days: trustScore.metrics.updatesLast30Days }
      });
    }

    // Trust score 50+ milestone
    if (!existingMilestones.includes('50-score-reached') && trustScore.overallTrustScore >= 50) {
      trustScore.milestones.push({
        type: '50-score-reached',
        achievedAt: new Date(),
        details: { score: trustScore.overallTrustScore }
      });
    }
  }

  /**
   * Get founders sorted by high-signal execution metrics
   */
  async getHighSignalFounders(filters = {}) {
    try {
      const {
        minExecutionVelocity = 3, // 3+ features shipped in last 30 days
        minTrustScore = 40,
        industry = null,
        stage = null,
        limit = 20,
        skip = 0
      } = filters;

      // Get all trust scores meeting minimum criteria
      const trustScores = await TrustScore.find({
        overallTrustScore: { $gte: minTrustScore },
        'metrics.featuresShippedLast30Days': { $gte: minExecutionVelocity }
      })
        .sort({ overallTrustScore: -1, 'metrics.updatesLast30Days': -1 })
        .skip(skip)
        .limit(limit);

      // Enrich with founder and startup data
      const results = await Promise.all(
        trustScores.map(async (ts) => {
          const founder = await User.findById(ts.founderId).select('-password');
          // In future, can filter by industry/stage here
          return {
            trustScore: ts,
            founder
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Error getting high-signal founders:', error);
      throw error;
    }
  }

  /**
   * Get trust score for a specific founder
   */
  async getTrustScore(founderId) {
    return await TrustScore.findOne({ founderId });
  }

  /**
   * Create default trust score for founder with no data
   */
  _createDefaultTrustScore(founderId) {
    return new TrustScore({
      founderId,
      velocityScore: 0,
      consistencyScore: 0,
      transparencyScore: 0,
      executionScore: 0,
      overallTrustScore: 0,
      metrics: {
        updatesLast7Days: 0,
        updatesLast30Days: 0,
        updatesLast90Days: 0,
        totalProofOfWorkEntries: 0,
        verifiedEntries: 0,
        entriesWithMetrics: 0,
        entriesWithCustomerFeedback: 0,
        featuresShippedLast30Days: 0,
        bugsFixedLast30Days: 0,
        customerInterviewsLast30Days: 0
      }
    });
  }
}

module.exports = new TrustScoreService();
