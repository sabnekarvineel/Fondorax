/**
 * Portfolio Analysis Service
 * AI-powered portfolio intelligence and optimization
 * Free, unlimited analytics using intelligent algorithms
 */

class PortfolioAnalysisService {
  /**
   * Comprehensive portfolio analysis
   */
  static async analyzePortfolio(portfolioData) {
    try {
      const analysis = {
        summary: this.generatePortfolioSummary(portfolioData),
        metrics: this.calculatePortfolioMetrics(portfolioData),
        diversification: this.analyzeDiversification(portfolioData),
        riskProfile: this.analyzeRiskProfile(portfolioData),
        performance: this.analyzePerformance(portfolioData),
        insights: this.generateInsights(portfolioData),
        recommendations: this.generatePortfolioRecommendations(portfolioData),
        sectorAnalysis: this.analyzeSectorDistribution(portfolioData),
        stageAnalysis: this.analyzeStageDistribution(portfolioData),
        alerts: this.generatePortfolioAlerts(portfolioData),
        predictions: this.predictFuturePerformance(portfolioData)
      };

      return analysis;
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive portfolio metrics
   */
  static calculatePortfolioMetrics(portfolioData) {
    const investments = portfolioData.investments || [];

    // Basic metrics
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0);
    const totalGain = totalValue - totalInvested;
    const roi = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;
    const annualizedROI = this.calculateAnnualizedROI(investments);

    // Risk metrics
    const avgScore = investments.length > 0 ?
      (investments.reduce((sum, inv) => sum + (inv.executionScore || 50), 0) / investments.length).toFixed(1) : 0;

    const avgChurn = investments.length > 0 ?
      (investments.reduce((sum, inv) => sum + (inv.churnRate || 5), 0) / investments.length).toFixed(2) : 0;

    // Concentration risk
    const largestInvestment = Math.max(...investments.map(inv => inv.amount || 0));
    const concentrationRisk = totalInvested > 0 ? ((largestInvestment / totalInvested) * 100).toFixed(2) : 0;

    // Portfolio age
    const avgAge = investments.length > 0 ?
      (investments.reduce((sum, inv) => sum + (inv.ageMonths || 12), 0) / investments.length).toFixed(1) : 0;

    return {
      totalInvested: Math.round(totalInvested),
      currentValue: Math.round(totalValue),
      totalGain: Math.round(totalGain),
      roi: `${roi}%`,
      annualizedROI: `${annualizedROI}%`,
      numberOfInvestments: investments.length,
      activeInvestments: investments.filter(inv => inv.status === 'active').length,
      exitedInvestments: investments.filter(inv => inv.status === 'exited').length,
      failedInvestments: investments.filter(inv => inv.status === 'failed').length,
      averageExecutionScore: avgScore,
      averageChurnRate: `${avgChurn}%`,
      concentrationRisk: `${concentrationRisk}%`,
      portfolioAge: `${avgAge} months`
    };
  }

  /**
   * Calculate annualized ROI
   */
  static calculateAnnualizedROI(investments) {
    if (investments.length === 0) return 0;

    let totalAnnualROI = 0;
    let count = 0;

    investments.forEach(inv => {
      const ageMonths = inv.ageMonths || 12;
      if (ageMonths > 0) {
        const gain = (inv.currentValue || inv.amount) - (inv.amount || 0);
        const holdingYears = ageMonths / 12;
        const annualReturn = (gain / (inv.amount || 1)) / holdingYears;
        totalAnnualROI += annualReturn * 100;
        count++;
      }
    });

    return count > 0 ? (totalAnnualROI / count).toFixed(2) : 0;
  }

  /**
   * Analyze portfolio diversification
   */
  static analyzeDiversification(portfolioData) {
    const investments = portfolioData.investments || [];
    const total = investments.length;

    if (total === 0) {
      return {
        score: 0,
        level: 'No investments',
        distribution: {},
        recommendations: ['Start building your portfolio with diversified investments']
      };
    }

    // Stage diversification
    const stageDistribution = {
      'pre-seed': 0,
      'seed': 0,
      'series-a': 0,
      'series-b': 0,
      'series-c+': 0
    };

    investments.forEach(inv => {
      const stage = inv.stage?.toLowerCase() || 'unknown';
      if (stageDistribution[stage] !== undefined) {
        stageDistribution[stage]++;
      }
    });

    // Sector diversification
    const sectorCount = new Set(investments.map(inv => inv.sector)).size;

    // Risk diversification
    const riskDistribution = {
      high: investments.filter(inv => inv.riskLevel === 'high').length,
      medium: investments.filter(inv => inv.riskLevel === 'medium').length,
      low: investments.filter(inv => inv.riskLevel === 'low').length
    };

    // Diversification score (0-100)
    let diversificationScore = 50; // Base

    // Stage diversity bonus
    const activeStages = Object.values(stageDistribution).filter(v => v > 0).length;
    diversificationScore += Math.min(20, activeStages * 4);

    // Sector diversity bonus
    diversificationScore += Math.min(20, sectorCount * 2);

    // Risk balance bonus
    if (riskDistribution.high < total * 0.4 && riskDistribution.low > total * 0.2) {
      diversificationScore += 10;
    }

    // Concentration penalty
    const largestInvestment = Math.max(...investments.map(inv => inv.amount || 0));
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const concentrationRatio = largestInvestment / (totalInvested || 1);
    if (concentrationRatio > 0.5) diversificationScore -= 20;
    else if (concentrationRatio > 0.3) diversificationScore -= 10;

    const level = diversificationScore >= 75 ? 'Excellent' :
                 diversificationScore >= 60 ? 'Good' :
                 diversificationScore >= 40 ? 'Fair' : 'Poor';

    const recommendations = this.generateDiversificationRecommendations(
      diversificationScore,
      stageDistribution,
      sectorCount,
      riskDistribution
    );

    return {
      score: Math.min(100, diversificationScore),
      level,
      stageDistribution,
      sectorDiversity: sectorCount,
      riskDistribution,
      recommendations
    };
  }

  /**
   * Generate diversification recommendations
   */
  static generateDiversificationRecommendations(score, stages, sectors, risks) {
    const recommendations = [];

    if (score < 40) {
      recommendations.push('Portfolio is too concentrated. Add investments across different stages and sectors.');
    }

    // Stage recommendations
    const activeStages = Object.values(stages).filter(v => v > 0).length;
    if (activeStages < 3) {
      recommendations.push(`Expand to ${3 - activeStages} more funding stages for better diversification.`);
    }

    // Sector recommendations
    if (sectors < 3) {
      recommendations.push(`Add investments in at least ${3 - sectors} more sectors to reduce industry risk.`);
    }

    // Risk recommendations
    if (risks.high > 0.4) {
      recommendations.push('Reduce exposure to high-risk investments. Consider adding lower-risk bets.');
    }
    if (risks.low < 0.2) {
      recommendations.push('Increase allocation to lower-risk, established startups for stability.');
    }

    if (recommendations.length === 0) {
      recommendations.push('Your portfolio diversification is well-balanced. Continue monitoring.');
    }

    return recommendations;
  }

  /**
   * Analyze portfolio risk profile
   */
  static analyzeRiskProfile(portfolioData) {
    const investments = portfolioData.investments || [];

    if (investments.length === 0) {
      return {
        overallRiskScore: 0,
        level: 'No risk',
        factors: [],
        mitigations: []
      };
    }

    // Calculate risk score
    let riskScore = 0;
    let riskFactors = [];

    // Factor 1: Concentration risk
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const maxInvestment = Math.max(...investments.map(inv => inv.amount || 0));
    const concentrationRatio = maxInvestment / (totalInvested || 1);

    if (concentrationRatio > 0.5) {
      riskScore += 25;
      riskFactors.push('High concentration risk - single investment exceeds 50%');
    } else if (concentrationRatio > 0.3) {
      riskScore += 15;
      riskFactors.push('Moderate concentration risk');
    }

    // Factor 2: High-risk investment ratio
    const highRiskCount = investments.filter(inv => inv.riskLevel === 'high').length;
    const highRiskRatio = highRiskCount / investments.length;

    if (highRiskRatio > 0.6) {
      riskScore += 25;
      riskFactors.push('Portfolio heavily weighted toward high-risk investments');
    } else if (highRiskRatio > 0.4) {
      riskScore += 15;
      riskFactors.push('Above-average exposure to high-risk investments');
    }

    // Factor 3: Early-stage concentration
    const earlyStage = investments.filter(inv => 
      ['pre-seed', 'seed'].includes(inv.stage?.toLowerCase())
    ).length;
    const earlyStageRatio = earlyStage / investments.length;

    if (earlyStageRatio > 0.7) {
      riskScore += 20;
      riskFactors.push('Heavy concentration in early-stage companies');
    } else if (earlyStageRatio > 0.5) {
      riskScore += 10;
      riskFactors.push('Significant early-stage exposure');
    }

    // Factor 4: Execution score average
    const avgExecutionScore = investments.reduce((sum, inv) => 
      sum + (inv.executionScore || 50), 0) / investments.length;

    if (avgExecutionScore < 40) {
      riskScore += 15;
      riskFactors.push('Average execution score indicates execution risk');
    } else if (avgExecutionScore < 55) {
      riskScore += 8;
      riskFactors.push('Below-average execution metrics');
    }

    // Factor 5: Churn rate average
    const avgChurn = investments.reduce((sum, inv) => sum + (inv.churnRate || 5), 0) / investments.length;
    if (avgChurn > 15) {
      riskScore += 10;
      riskFactors.push('High average customer churn across portfolio');
    }

    // Factor 6: Failed investments
    const failedInvestments = investments.filter(inv => inv.status === 'failed').length;
    if (failedInvestments > investments.length * 0.3) {
      riskScore += 15;
      riskFactors.push('High portfolio failure rate');
    }

    const riskLevel = riskScore >= 75 ? 'Critical' :
                     riskScore >= 60 ? 'High' :
                     riskScore >= 40 ? 'Moderate' :
                     riskScore >= 20 ? 'Low' : 'Minimal';

    const mitigations = this.generateRiskMitigations(riskFactors, investments);

    return {
      overallRiskScore: riskScore,
      level: riskLevel,
      factors: riskFactors,
      mitigations
    };
  }

  /**
   * Generate risk mitigation strategies
   */
  static generateRiskMitigations(riskFactors, investments) {
    const mitigations = [];

    riskFactors.forEach(factor => {
      if (factor.includes('concentration')) {
        mitigations.push('Rebalance portfolio to reduce single investment concentration below 30%');
      }
      if (factor.includes('high-risk')) {
        mitigations.push('Gradually increase allocation to lower-risk, more established companies');
      }
      if (factor.includes('early-stage')) {
        mitigations.push('Add Series B+ investments for portfolio stability');
      }
      if (factor.includes('execution')) {
        mitigations.push('Increase monitoring frequency for low-execution-score companies');
      }
      if (factor.includes('churn')) {
        mitigations.push('Review retention strategies with portfolio companies');
      }
      if (factor.includes('failure')) {
        mitigations.push('Conduct post-mortem analysis on failed investments');
      }
    });

    return [...new Set(mitigations)]; // Remove duplicates
  }

  /**
   * Analyze portfolio performance trends
   */
  static analyzePerformance(portfolioData) {
    const investments = portfolioData.investments || [];

    const performance = {
      topPerformers: [],
      underperformers: [],
      trends: {},
      summary: ''
    };

    // Calculate performance metrics
    const performanceData = investments.map(inv => ({
      ...inv,
      gain: (inv.currentValue || inv.amount) - (inv.amount || 0),
      roi: ((inv.currentValue || inv.amount - (inv.amount || 0)) / (inv.amount || 1)) * 100
    })).sort((a, b) => b.roi - a.roi);

    // Top performers (top 20%)
    const topCount = Math.ceil(investments.length * 0.2) || 1;
    performance.topPerformers = performanceData.slice(0, topCount);

    // Underperformers (bottom 20%)
    const bottomCount = Math.ceil(investments.length * 0.2) || 1;
    performance.underperformers = performanceData.slice(-bottomCount).reverse();

    // Status trends
    performance.trends = {
      active: investments.filter(inv => inv.status === 'active').length,
      exited: investments.filter(inv => inv.status === 'exited').length,
      failed: investments.filter(inv => inv.status === 'failed').length
    };

    // Performance summary
    const avgROI = performanceData.reduce((sum, inv) => sum + (inv.roi || 0), 0) / performanceData.length;
    const positivePct = (performanceData.filter(inv => inv.roi > 0).length / performanceData.length) * 100;

    performance.summary = `Portfolio is performing at ${avgROI.toFixed(1)}% average ROI. ` +
      `${positivePct.toFixed(0)}% of investments are profitable.`;

    return performance;
  }

  /**
   * Analyze sector distribution
   */
  static analyzeSectorDistribution(portfolioData) {
    const investments = portfolioData.investments || [];
    const sectorMap = new Map();

    investments.forEach(inv => {
      const sector = inv.sector || 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) || 0) + 1);
    });

    const total = investments.length;
    const distribution = {};

    sectorMap.forEach((count, sector) => {
      distribution[sector] = {
        count,
        percentage: ((count / total) * 100).toFixed(1)
      };
    });

    return distribution;
  }

  /**
   * Analyze stage distribution
   */
  static analyzeStageDistribution(portfolioData) {
    const investments = portfolioData.investments || [];
    const stageMap = {
      'pre-seed': 0,
      'seed': 0,
      'series-a': 0,
      'series-b': 0,
      'series-c': 0,
      'series-d+': 0
    };

    investments.forEach(inv => {
      const stage = inv.stage?.toLowerCase() || 'unknown';
      if (stageMap[stage] !== undefined) {
        stageMap[stage]++;
      }
    });

    const total = investments.length;
    const distribution = {};

    Object.forEach((stage, count) => {
      if (count > 0) {
        distribution[stage] = {
          count,
          percentage: ((count / total) * 100).toFixed(1)
        };
      }
    });

    return distribution;
  }

  /**
   * Generate AI insights
   */
  static generateInsights(portfolioData) {
    const investments = portfolioData.investments || [];
    const insights = [];

    if (investments.length === 0) {
      return ['Start building your investment portfolio with diversified bets'];
    }

    // Insight 1: Portfolio maturity
    const avgAge = investments.reduce((sum, inv) => sum + (inv.ageMonths || 12), 0) / investments.length;
    if (avgAge < 6) {
      insights.push('Portfolio is newly formed. Continue monitoring for early traction signals.');
    } else if (avgAge > 36) {
      insights.push('Portfolio has matured. Expect more exits and returns realization.');
    }

    // Insight 2: Growth trajectory
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const avgGrowth = activeInvestments.length > 0 ?
      activeInvestments.reduce((sum, inv) => sum + (inv.momGrowth || 10), 0) / activeInvestments.length : 0;

    if (avgGrowth > 30) {
      insights.push('Portfolio companies show strong month-over-month growth.');
    } else if (avgGrowth < 5) {
      insights.push('Growth rates are moderate. Consider additional acceleration strategies.');
    }

    // Insight 3: Team quality
    const strongTeams = investments.filter(inv => inv.executionScore > 70).length;
    if (strongTeams > investments.length * 0.6) {
      insights.push('Portfolio has strong founding teams with proven execution capability.');
    }

    // Insight 4: Exit readiness
    const exitReady = investments.filter(inv => inv.status === 'active' && 
      inv.yearsToExit <= 1).length;
    if (exitReady > 0) {
      insights.push(`${exitReady} companies appear ready for potential exits in next 12 months.`);
    }

    // Insight 5: Sector trends
    const sectors = new Set(investments.map(inv => inv.sector));
    if (sectors.size === 1) {
      insights.push('Portfolio is concentrated in single sector. Consider sector diversification.');
    } else if (sectors.size > 5) {
      insights.push('Portfolio spans multiple sectors. Excellent diversification strategy.');
    }

    return insights;
  }

  /**
   * Generate portfolio recommendations
   */
  static generatePortfolioRecommendations(portfolioData) {
    const investments = portfolioData.investments || [];
    const recommendations = [];

    if (investments.length < 5) {
      recommendations.push('Build to minimum 5 investments for adequate diversification');
    }

    if (investments.length > 30) {
      recommendations.push('Consider consolidating portfolio - too many positions to manage effectively');
    }

    // Stage recommendations
    const seed = investments.filter(inv => inv.stage === 'seed').length;
    const seriesA = investments.filter(inv => inv.stage === 'series-a').length;

    if (seed > seriesA * 2) {
      recommendations.push('Add Series A+ companies for portfolio maturation');
    }

    // Sector recommendations
    const sectors = new Set(investments.map(inv => inv.sector));
    if (sectors.size < 3) {
      recommendations.push(`Expand to at least 3 sectors. Currently in ${sectors.size}`);
    }

    // Rebalancing
    const largestInvestment = Math.max(...investments.map(inv => inv.amount || 0));
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    if (largestInvestment > totalInvested * 0.3) {
      recommendations.push('Rebalance to reduce concentration in largest position');
    }

    // Performance follow-up
    const underperformers = investments.filter(inv => inv.roi < -30 && inv.status === 'active');
    if (underperformers.length > 0) {
      recommendations.push(`Review strategy with ${underperformers.length} underperforming companies`);
    }

    return recommendations.length > 0 ? recommendations : 
      ['Portfolio is well-structured. Continue monitoring and rebalancing quarterly.'];
  }

  /**
   * Generate portfolio alerts
   */
  static generatePortfolioAlerts(portfolioData) {
    const investments = portfolioData.investments || [];
    const alerts = [];

    // Failed investment alert
    const failedCount = investments.filter(inv => inv.status === 'failed').length;
    if (failedCount > 0) {
      alerts.push({
        level: 'critical',
        title: 'Failed Investments',
        message: `${failedCount} investments have failed. Learn from these experiences.`
      });
    }

    // Runway alert
    const lowRunway = investments.filter(inv => inv.runway < 3).length;
    if (lowRunway > 0) {
      alerts.push({
        level: 'warning',
        title: 'Low Runway Alert',
        message: `${lowRunway} portfolio companies have less than 3 months runway.`
      });
    }

    // Churn alert
    const highChurn = investments.filter(inv => inv.churnRate > 15).length;
    if (highChurn > 0) {
      alerts.push({
        level: 'warning',
        title: 'High Churn Companies',
        message: `${highChurn} companies showing high customer churn rates.`
      });
    }

    // Concentration alert
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const largestInvestment = Math.max(...investments.map(inv => inv.amount || 0));
    if (largestInvestment > totalInvested * 0.4) {
      alerts.push({
        level: 'info',
        title: 'Concentration Risk',
        message: 'Single investment exceeds 40% of portfolio. Consider rebalancing.'
      });
    }

    return alerts;
  }

  /**
   * Predict future portfolio performance
   */
  static predictFuturePerformance(portfolioData) {
    const investments = portfolioData.investments || [];

    // Calculate baseline metrics
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const avgExecutionScore = activeInvestments.length > 0 ?
      activeInvestments.reduce((sum, inv) => sum + (inv.executionScore || 50), 0) / activeInvestments.length : 50;

    const avgGrowth = activeInvestments.length > 0 ?
      activeInvestments.reduce((sum, inv) => sum + (inv.momGrowth || 10), 0) / activeInvestments.length : 10;

    // Predictions
    const predictions = {
      sixMonthOutlook: this.predictSixMonth(activeInvestments, avgGrowth),
      oneYearOutlook: this.predictOneYear(activeInvestments, avgGrowth),
      potentialROI: this.calculatePotentialROI(investments, avgExecutionScore),
      exitProbability: this.calculateExitProbability(activeInvestments),
      summaryForecast: ''
    };

    // Generate forecast summary
    if (predictions.potentialROI > 300) {
      predictions.summaryForecast = '🟢 Excellent growth potential. Portfolio is well-positioned for strong returns.';
    } else if (predictions.potentialROI > 100) {
      predictions.summaryForecast = '🟡 Solid growth potential. Continue monitoring and supporting portfolio companies.';
    } else {
      predictions.summaryForecast = '🟠 Moderate potential. Focus on derisk and accelerate high-performers.';
    }

    return predictions;
  }

  /**
   * Predict 6-month performance
   */
  static predictSixMonth(investments, avgGrowth) {
    const projectedGrowth = avgGrowth * 6 * 0.9; // Conservative estimate
    return {
      expectedGrowth: `${projectedGrowth.toFixed(1)}%`,
      confidenceLevel: 'High',
      keyDrivers: ['Current revenue growth', 'Product development', 'Market expansion'],
      risks: ['Market downturn', 'Team changes', 'Competition']
    };
  }

  /**
   * Predict 1-year performance
   */
  static predictOneYear(investments, avgGrowth) {
    const projectedGrowth = avgGrowth * 12 * 0.75; // Moderate assumption
    return {
      expectedGrowth: `${projectedGrowth.toFixed(1)}%`,
      confidenceLevel: 'Moderate',
      keyDrivers: ['Market adoption', 'Funding rounds', 'Team expansion'],
      risks: ['Economic factors', 'Competitive intensity', 'Retention']
    };
  }

  /**
   * Calculate potential ROI
   */
  static calculatePotentialROI(investments, avgExecutionScore) {
    const activeInvestments = investments.filter(inv => inv.status === 'active');
    const baseROI = activeInvestments.length > 0 ?
      (avgExecutionScore / 50) * 100 : 50;

    const ageMultiplier = activeInvestments.length > 0 ?
      (activeInvestments.reduce((sum, inv) => sum + (inv.ageMonths || 12), 0) / activeInvestments.length) / 36 : 1;

    return Math.round(baseROI * Math.max(0.5, Math.min(3, ageMultiplier)));
  }

  /**
   * Calculate exit probability
   */
  static calculateExitProbability(investments) {
    if (investments.length === 0) return '0%';

    const exitReady = investments.filter(inv =>
      inv.executionScore >= 75 && inv.momGrowth >= 20 && inv.runway >= 12
    ).length;

    const probability = (exitReady / investments.length) * 100;
    return `${probability.toFixed(0)}%`;
  }

  /**
   * Generate portfolio summary
   */
  static generatePortfolioSummary(portfolioData) {
    const investments = portfolioData.investments || [];
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const totalValue = investments.reduce((sum, inv) => sum + (inv.currentValue || inv.amount || 0), 0);

    let summary = '';

    if (investments.length === 0) {
      summary = 'No investments in portfolio. Start building your portfolio today.';
    } else {
      const gain = totalValue - totalInvested;
      const roi = ((gain / totalInvested) * 100).toFixed(1);
      summary = `Portfolio of ${investments.length} investments valued at $${totalValue.toLocaleString()} ` +
        `(${gain >= 0 ? '+' : ''}${roi}% return). `;

      const active = investments.filter(inv => inv.status === 'active').length;
      summary += `${active} active investments, `;

      const exited = investments.filter(inv => inv.status === 'exited').length;
      summary += `${exited} exits, `;

      const failed = investments.filter(inv => inv.status === 'failed').length;
      summary += `${failed} failures.`;
    }

    return summary;
  }
}

module.exports = PortfolioAnalysisService;
