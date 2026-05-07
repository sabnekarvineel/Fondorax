const ProofOfWork = require('../models/ProofOfWork');

class ProofOfWorkAnalyzer {
  /**
   * Calculate founder execution velocity over time
   * Measures shipping speed and consistency
   */
  static async calculateVelocity(founderId, timeWindowDays = 30) {
    try {
      const startDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);
      const entries = await ProofOfWork.find({
        founderId,
        displayDate: { $gte: startDate }
      }).sort({ displayDate: -1 });

      if (entries.length === 0) return 0;

      // Count entries per week
      const weeks = Math.ceil(timeWindowDays / 7);
      const entriesPerWeek = entries.length / weeks;

      // Weight: product releases > customer interviews > metrics
      let weightedScore = 0;
      entries.forEach(entry => {
        if (entry.type === 'product-changelog') weightedScore += 3;
        if (entry.type === 'customer-interview') weightedScore += 2;
        if (entry.type === 'growth-metric') weightedScore += 1.5;
        if (entry.type === 'revenue-milestone') weightedScore += 2.5;
      });

      const velocityScore = Math.min(100, (entriesPerWeek * 10) + (weightedScore / entries.length * 5));
      return Math.round(velocityScore);
    } catch (err) {
      console.error('Error calculating velocity:', err);
      return 0;
    }
  }

  /**
   * Calculate transparency score
   * Measures how much real data founder is sharing
   */
  static async calculateTransparency(founderId) {
    try {
      const entries = await ProofOfWork.find({ founderId });

      if (entries.length === 0) return 0;

      let transparencyScore = 0;
      const maxScore = entries.length * 100;

      entries.forEach(entry => {
        let score = 20; // Base score

        // Customer interviews with recordings: +30
        if (entry.customerInterview?.customerName && entry.customerInterview?.videoUrl) {
          score += 30;
        }

        // Real metrics: +25
        if (entry.metrics.mau || entry.metrics.mrr || entry.metrics.nps) {
          score += 25;
        }

        // Detailed changelog: +20
        if (entry.changelog?.features?.length > 2 || entry.changelog?.bugFixes?.length > 1) {
          score += 20;
        }

        // Verified: +10
        if (entry.verified) {
          score += 10;
        }

        // Attachments: +15
        if (entry.attachments?.length > 0) {
          score += 15;
        }

        transparencyScore += Math.min(100, score);
      });

      return Math.round((transparencyScore / maxScore) * 100) || 0;
    } catch (err) {
      console.error('Error calculating transparency:', err);
      return 0;
    }
  }

  /**
   * Get founder's proof of work summary for investors
   * Shows execution story in investor-friendly format
   */
  static async generateInvestorSummary(founderId) {
    try {
      const entries = await ProofOfWork.find({ founderId, isPublic: true })
        .sort({ displayDate: -1 })
        .limit(20);

      if (entries.length === 0) {
        return {
          message: 'No proof of work entries yet',
          readiness: 'Not Ready'
        };
      }

      const summary = {
        lastUpdate: entries[0].displayDate,
        totalEntries: entries.length,
        entriesByType: this._countByType(entries),
        highlights: {
          productShips: entries.filter(e => e.type === 'product-changelog').length,
          customerVoice: entries.filter(e => e.type === 'customer-interview').length,
          revenueGrowth: entries.filter(e => e.type === 'revenue-milestone').length,
          metricsShared: entries.filter(e => e.type === 'growth-metric').length
        },
        recentMetrics: this._extractLatestMetrics(entries),
        executionStory: this._buildExecutionNarrative(entries),
        readiness: this._assessReadiness(entries)
      };

      return summary;
    } catch (err) {
      console.error('Error generating summary:', err);
      return null;
    }
  }

  /**
   * Assess founder readiness based on proof of work
   */
  static _assessReadiness(entries) {
    const metrics = {
      hasProductUpdates: entries.some(e => e.type === 'product-changelog'),
      hasCustomerProof: entries.some(e => e.type === 'customer-interview'),
      hasMetrics: entries.some(e => e.metrics.mau || e.metrics.mrr),
      consistentUpdates: entries.length >= 5,
      recentActivity: new Date(entries[0].displayDate) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    };

    const score = Object.values(metrics).filter(v => v).length;
    if (score === 5) return 'Investor Ready';
    if (score >= 4) return 'Strong';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Developing';
    return 'Early Stage';
  }

  /**
   * Extract most recent metrics for overview
   */
  static _extractLatestMetrics(entries) {
    const metricsEntry = entries.find(e => e.metrics.mau || e.metrics.mrr || e.metrics.nps);
    
    if (!metricsEntry) return null;

    return {
      mau: metricsEntry.metrics.mau,
      mrr: metricsEntry.metrics.mrr,
      nps: metricsEntry.metrics.nps,
      churnRate: metricsEntry.metrics.churnRate,
      lastUpdated: metricsEntry.displayDate
    };
  }

  /**
   * Build narrative of execution story
   */
  static _buildExecutionNarrative(entries) {
    const narrative = {
      productMomentum: entries
        .filter(e => e.type === 'product-changelog')
        .slice(0, 3)
        .map(e => ({
          title: e.title,
          date: e.displayDate,
          features: e.changelog?.features?.slice(0, 2) || []
        })),
      customerValidation: entries
        .filter(e => e.type === 'customer-interview')
        .slice(0, 3)
        .map(e => ({
          customer: e.customerInterview?.customerName,
          company: e.customerInterview?.companyName,
          date: e.displayDate,
          hasVideo: !!e.customerInterview?.videoUrl
        })),
        growthTrajectory: entries
        .filter(e => e.type === 'growth-metric')
        .slice(0, 3)
        .map(e => ({
          title: e.title,
          date: e.displayDate,
          metrics: {
            mau: e.metrics.mau,
            mrr: e.metrics.mrr
          }
        }))
    };

    return narrative;
  }

  static _countByType(entries) {
    const counts = {};
    entries.forEach(entry => {
      counts[entry.type] = (counts[entry.type] || 0) + 1;
    });
    return counts;
  }

  /**
   * Get competitive positioning data
   * Compares founder against others in network
   */
  static async getCompetitiveMetrics(founderId) {
    try {
      const founderEntries = await ProofOfWork.find({ founderId });
      const founderVelocity = await this.calculateVelocity(founderId);
      const founderTransparency = await this.calculateTransparency(founderId);

      return {
        founderVelocity,
        founderTransparency,
        totalEntries: founderEntries.length,
        updated: new Date()
      };
    } catch (err) {
      console.error('Error getting competitive metrics:', err);
      return null;
    }
  }
}

module.exports = ProofOfWorkAnalyzer;
