/**
 * Pitch Deck Analysis Service
 * AI-powered analysis using rule-based intelligent scoring
 * No external API costs - completely free
 */

const axios = require('axios');

class PitchAnalysisService {
  /**
   * Analyze pitch data using AI-powered scoring engine
   */
  static async analyzePitch(pitchData) {
    try {
      const analysis = {
        foundScore: this.scoreFounder(pitchData.founder),
        marketScore: this.scoreMarket(pitchData.market),
        productScore: this.scoreProduct(pitchData.product),
        tractionScore: this.scoreTraction(pitchData.traction),
        financeScore: this.scoreFinance(pitchData.finance),
        riskScore: this.scoreRisk(pitchData),
        overallScore: 0,
        riskLevel: '',
        alerts: [],
        recommendations: [],
        summary: '',
        swotAnalysis: this.generateSWOT(pitchData),
        metrics: this.extractMetrics(pitchData)
      };

      // Calculate weighted overall score
      analysis.overallScore = this.calculateWeightedScore(analysis);
      analysis.riskLevel = this.determineRiskLevel(analysis.overallScore, analysis.riskScore);
      analysis.alerts = this.generateAlerts(analysis, pitchData);
      analysis.recommendations = this.generateRecommendations(analysis);
      analysis.summary = this.generateAISummary(analysis, pitchData);

      return analysis;
    } catch (error) {
      console.error('Pitch analysis error:', error);
      throw error;
    }
  }

  /**
   * Score Founder & Team (Weight: 20%)
   */
  static scoreFounder(founderData) {
    let score = 50; // Base score

    if (!founderData) return score;

    // Experience evaluation
    const experience = founderData.yearsExperience || 0;
    if (experience >= 10) score += 20;
    else if (experience >= 5) score += 15;
    else if (experience >= 2) score += 10;
    else if (experience > 0) score += 5;

    // Previous startup experience
    if (founderData.previousStartups) {
      const startupCount = founderData.previousStartups;
      if (startupCount >= 3) score += 15;
      else if (startupCount >= 2) score += 12;
      else if (startupCount === 1) score += 8;
    }

    // Domain expertise
    if (founderData.domainExpertise) score += 10;

    // Co-founder presence
    if (founderData.hasCoFounder) score += 10;
    if (founderData.hasTechCoFounder) score += 10;

    // Full-time commitment
    if (founderData.fullTime) score += 10;

    // Education
    if (founderData.education === 'PhD') score += 5;
    else if (founderData.education === 'Masters') score += 3;

    // Network strength
    if (founderData.networkStrength === 'strong') score += 5;

    return Math.min(100, score);
  }

  /**
   * Score Market Opportunity (Weight: 15%)
   */
  static scoreMarket(marketData) {
    let score = 50; // Base score

    if (!marketData) return score;

    // TAM/SAM/SOM analysis
    const tam = parseFloat(marketData.tam) || 0;
    if (tam >= 1000000000) score += 20; // $1B+
    else if (tam >= 100000000) score += 15; // $100M+
    else if (tam >= 10000000) score += 10;

    // Market growth rate
    const growthRate = parseFloat(marketData.growthRate) || 0;
    if (growthRate >= 40) score += 15;
    else if (growthRate >= 20) score += 12;
    else if (growthRate >= 10) score += 8;

    // Market timing
    if (marketData.isTimely) score += 10;

    // Competitive landscape
    const competitors = marketData.competitorCount || 0;
    if (competitors === 0) score += 5; // First mover
    else if (competitors <= 3) score += 10;
    else if (competitors <= 10) score += 5;

    // Market validation
    if (marketData.isValidated) score += 10;

    // TAM realism check (penalize if unrealistic)
    if (tam > 10000000000 && !marketData.realistic) score -= 20;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Product & Differentiation (Weight: 15%)
   */
  static scoreProduct(productData) {
    let score = 50; // Base score

    if (!productData) return score;

    // Product stage
    const stage = productData.stage || 'idea';
    const stageScores = {
      'revenue': 30,
      'paying-customers': 25,
      'beta': 15,
      'mvp': 10,
      'prototype': 5,
      'idea': 0
    };
    score += stageScores[stage.toLowerCase()] || 0;

    // Unique value proposition
    if (productData.hasUVP) score += 10;
    if (productData.isUnique) score += 10;

    // Technical moat
    if (productData.hasMoat) score += 10;
    if (productData.hasPatent) score += 5;
    if (productData.hasProprietary) score += 5;

    // Market fit indicators
    if (productData.hasProductMarketFit) score += 10;

    // User feedback
    if (productData.hasUserFeedback) score += 5;

    // Technology stack quality
    if (productData.technologyMaturity === 'proven') score += 5;

    return Math.min(100, score);
  }

  /**
   * Score Traction & Growth (Weight: 25% - Most Important)
   */
  static scoreTraction(tractionData) {
    let score = 30; // Base score (traction requires proof)

    if (!tractionData) return score;

    // Revenue
    const revenue = parseFloat(tractionData.monthlyRevenue) || 0;
    if (revenue >= 100000) score += 25;
    else if (revenue >= 50000) score += 20;
    else if (revenue >= 10000) score += 15;
    else if (revenue >= 1000) score += 10;
    else if (revenue > 0) score += 5;

    // Growth rate (MoM)
    const growthRate = parseFloat(tractionData.momGrowth) || 0;
    if (growthRate >= 50) score += 20;
    else if (growthRate >= 20) score += 15;
    else if (growthRate >= 10) score += 10;
    else if (growthRate > 0) score += 5;

    // Users
    const users = parseFloat(tractionData.activeUsers) || 0;
    if (users >= 100000) score += 15;
    else if (users >= 10000) score += 12;
    else if (users >= 1000) score += 8;

    // Retention rate
    const retention = parseFloat(tractionData.retentionRate) || 0;
    if (retention >= 80) score += 10;
    else if (retention >= 60) score += 7;
    else if (retention >= 40) score += 3;

    // Churn rate (lower is better)
    const churn = parseFloat(tractionData.churnRate) || 0;
    if (churn <= 5) score += 10;
    else if (churn <= 10) score += 5;

    // Conversion rate
    const conversion = parseFloat(tractionData.conversionRate) || 0;
    if (conversion >= 10) score += 10;
    else if (conversion >= 5) score += 7;
    else if (conversion >= 2) score += 3;

    return Math.min(100, score);
  }

  /**
   * Score Financial Health (Weight: 15%)
   */
  static scoreFinance(financeData) {
    let score = 50; // Base score

    if (!financeData) return score;

    // Burn rate analysis
    const burnRate = parseFloat(financeData.monthlyBurn) || 0;
    const runway = parseFloat(financeData.runway) || 0;

    // Healthy runway
    if (runway >= 24) score += 15;
    else if (runway >= 12) score += 10;
    else if (runway >= 6) score += 5;
    else if (runway < 3) score -= 20; // Critical

    // LTV/CAC ratio (optimal: 3:1 or higher)
    const ltv = parseFloat(financeData.ltv) || 0;
    const cac = parseFloat(financeData.cac) || 1;
    const ratio = cac > 0 ? ltv / cac : 0;

    if (ratio >= 5) score += 15;
    else if (ratio >= 3) score += 12;
    else if (ratio >= 1) score += 5;
    else if (ratio > 0) score -= 5;

    // Gross margin
    const margin = parseFloat(financeData.grossMargin) || 0;
    if (margin >= 60) score += 15;
    else if (margin >= 40) score += 10;
    else if (margin >= 20) score += 5;

    // Burn multiple (revenue/burn)
    const revenue = parseFloat(financeData.monthlyRevenue) || 0;
    if (burnRate > 0) {
      const burnMultiple = revenue / burnRate;
      if (burnMultiple >= 1) score += 10; // Revenue > burn
      else if (burnMultiple >= 0.5) score += 5;
    }

    // Funding history
    if (financeData.previousFunding) score += 10;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Score Risk Factors (Weight: 10%)
   * Lower risk = higher score
   */
  static scoreRisk(pitchData) {
    let riskScore = 100; // Start high (low risk)

    // Critical risks
    const runway = parseFloat(pitchData.finance?.runway) || 12;
    if (runway < 3) riskScore -= 30; // Critical runway

    const churn = parseFloat(pitchData.traction?.churnRate) || 0;
    if (churn > 15) riskScore -= 20; // High churn

    // Team risks
    if (!pitchData.founder?.hasCoFounder) riskScore -= 15; // Solo founder
    if (pitchData.founder?.yearsExperience < 2) riskScore -= 10;

    // Financial risks
    const burnMultiple = (pitchData.finance?.monthlyRevenue || 0) / (pitchData.finance?.monthlyBurn || 1);
    if (burnMultiple > 3) riskScore -= 15; // High burn multiple

    // Market risks
    const tam = parseFloat(pitchData.market?.tam) || 0;
    if (tam > 50000000000) riskScore -= 10; // Unrealistic TAM

    // Product risks
    if (pitchData.product?.stage === 'idea') riskScore -= 10;

    // Growth sustainability
    const growthRate = parseFloat(pitchData.traction?.momGrowth) || 0;
    if (growthRate > 100) riskScore -= 5; // Unsustainable growth

    return Math.max(0, riskScore);
  }

  /**
   * Calculate weighted overall score
   */
  static calculateWeightedScore(analysis) {
    return Math.round(
      (analysis.foundScore * 0.20) +
      (analysis.marketScore * 0.15) +
      (analysis.productScore * 0.15) +
      (analysis.tractionScore * 0.25) +
      (analysis.financeScore * 0.15) +
      (analysis.riskScore * 0.10)
    );
  }

  /**
   * Determine risk level based on scores
   */
  static determineRiskLevel(overallScore, riskScore) {
    if (overallScore >= 75 && riskScore >= 70) return 'Low Risk';
    if (overallScore >= 60 && riskScore >= 50) return 'Moderate Risk';
    if (overallScore >= 45 && riskScore >= 30) return 'High Risk';
    return 'Critical Risk';
  }

  /**
   * Generate AI alerts and red flags
   */
  static generateAlerts(analysis, pitchData) {
    const alerts = [];

    // Financial alerts
    const runway = parseFloat(pitchData.finance?.runway) || 12;
    if (runway < 3) alerts.push({
      level: 'critical',
      title: 'Critical Runway Alert',
      message: `Only ${runway} months of runway remaining. Immediate funding required.`
    });

    const churn = parseFloat(pitchData.traction?.churnRate) || 0;
    if (churn > 15) alerts.push({
      level: 'warning',
      title: 'High Churn Rate',
      message: `${churn}% monthly churn indicates retention issues.`
    });

    // Team alerts
    if (!pitchData.founder?.hasCoFounder) alerts.push({
      level: 'warning',
      title: 'Solo Founder',
      message: 'Startups with single founders have higher failure rates.'
    });

    // Traction alerts
    const revenue = parseFloat(pitchData.traction?.monthlyRevenue) || 0;
    if (revenue === 0 && pitchData.product?.stage === 'idea') alerts.push({
      level: 'info',
      title: 'Pre-revenue Stage',
      message: 'Startup is in idea/MVP stage with no revenue traction yet.'
    });

    // Market alerts
    const tam = parseFloat(pitchData.market?.tam) || 0;
    if (tam > 50000000000 && !pitchData.market?.realistic) alerts.push({
      level: 'warning',
      title: 'Unrealistic TAM',
      message: 'TAM estimate appears inflated. Validate market sizing.'
    });

    // Growth sustainability
    const growthRate = parseFloat(pitchData.traction?.momGrowth) || 0;
    if (growthRate > 100) alerts.push({
      level: 'info',
      title: 'Exceptional Growth Rate',
      message: `${growthRate}% MoM growth. Monitor sustainability.`
    });

    // Risk score alerts
    if (analysis.riskScore < 40) alerts.push({
      level: 'critical',
      title: 'High Risk Profile',
      message: 'Multiple risk factors detected. Detailed due diligence recommended.'
    });

    return alerts;
  }

  /**
   * Generate investment recommendations
   */
  static generateRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallScore >= 75) {
      recommendations.push('🟢 Strong Investment Candidate');
      recommendations.push('Meets criteria for Series A/B consideration');
      recommendations.push('Focus due diligence on market expansion');
    } else if (analysis.overallScore >= 60) {
      recommendations.push('🟡 Watchlist Potential');
      recommendations.push('Promising but requires monitoring');
      recommendations.push('Schedule follow-up in 3 months');
      recommendations.push('Request traction updates');
    } else if (analysis.overallScore >= 45) {
      recommendations.push('🟠 High Risk Investment');
      recommendations.push('Viable with significant support');
      recommendations.push('Requires hands-on mentorship');
      recommendations.push('Consider smaller initial investment');
    } else {
      recommendations.push('🔴 Not Recommended');
      recommendations.push('Risk profile exceeds return potential');
      recommendations.push('Revisit after significant traction');
    }

    return recommendations;
  }

  /**
   * Generate SWOT Analysis
   */
  static generateSWOT(pitchData) {
    const swot = {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };

    // Strengths
    if (pitchData.founder?.yearsExperience >= 5) swot.strengths.push('Experienced founding team');
    if (pitchData.product?.stage === 'revenue') swot.strengths.push('Revenue-generating product');
    if (parseFloat(pitchData.traction?.momGrowth) > 20) swot.strengths.push('Strong growth trajectory');
    if (pitchData.product?.hasMoat) swot.strengths.push('Defensible technology/moat');

    // Weaknesses
    if (!pitchData.founder?.hasCoFounder) swot.weaknesses.push('Solo founder - execution risk');
    if (parseFloat(pitchData.finance?.runway) < 6) swot.weaknesses.push('Limited runway');
    if (parseFloat(pitchData.traction?.churnRate) > 10) swot.weaknesses.push('High customer churn');
    if (pitchData.product?.stage === 'idea') swot.weaknesses.push('Early stage - execution risk');

    // Opportunities
    if (parseFloat(pitchData.market?.growthRate) > 20) swot.opportunities.push('High-growth market');
    if (pitchData.market?.isTimely) swot.opportunities.push('Perfect market timing');
    if (!pitchData.market?.competitorCount) swot.opportunities.push('First-mover advantage');
    swot.opportunities.push('Expansion to adjacent markets');

    // Threats
    if (parseFloat(pitchData.market?.competitorCount) > 10) swot.threats.push('Intense competitive landscape');
    if (pitchData.finance?.monthlyBurn > pitchData.finance?.monthlyRevenue) swot.threats.push('Burn rate exceeds revenue');
    if (parseFloat(pitchData.traction?.conversionRate) < 2) swot.threats.push('Low customer conversion');
    swot.threats.push('Market adoption uncertainty');

    return swot;
  }

  /**
   * Extract and calculate key metrics
   */
  static extractMetrics(pitchData) {
    const finance = pitchData.finance || {};
    const traction = pitchData.traction || {};

    const revenue = parseFloat(finance.monthlyRevenue) || 0;
    const burn = parseFloat(finance.monthlyBurn) || 0;
    const ltv = parseFloat(finance.ltv) || 0;
    const cac = parseFloat(finance.cac) || 1;

    return {
      ltv_cac_ratio: (ltv / cac).toFixed(2),
      burn_multiple: (revenue / burn).toFixed(2),
      monthly_revenue: revenue,
      monthly_burn: burn,
      monthly_net: (revenue - burn).toFixed(2),
      runway_months: Math.round(parseFloat(finance.runway) || 0),
      growth_rate: (parseFloat(traction.momGrowth) || 0).toFixed(1),
      retention_rate: (parseFloat(traction.retentionRate) || 0).toFixed(1),
      churn_rate: (parseFloat(traction.churnRate) || 0).toFixed(1)
    };
  }

  /**
   * Generate AI-powered summary using intelligent pattern matching
   */
  static generateAISummary(analysis, pitchData) {
    let summary = '';

    // Opening statement
    const scoreLevel = analysis.overallScore >= 75 ? 'strong' :
                      analysis.overallScore >= 60 ? 'promising' :
                      analysis.overallScore >= 45 ? 'developing' : 'early-stage';

    summary += `${pitchData.companyName} shows ${scoreLevel} fundamentals with an overall score of ${analysis.overallScore}/100. `;

    // Strengths narrative
    if (analysis.tractionScore >= 75) {
      summary += `The startup demonstrates exceptional traction with strong revenue growth. `;
    } else if (analysis.tractionScore >= 60) {
      summary += `Notable traction progress is evident with consistent growth metrics. `;
    }

    // Team narrative
    if (analysis.foundScore >= 75) {
      summary += `The founding team brings substantial industry experience and expertise. `;
    } else if (analysis.foundScore >= 60) {
      summary += `Team has relevant experience but may benefit from additional complementary skills. `;
    }

    // Market narrative
    if (analysis.marketScore >= 75) {
      summary += `Operating in a large, high-growth market with clear demand signals. `;
    } else if (analysis.marketScore >= 60) {
      summary += `Market opportunity is substantial with defined customer segments. `;
    }

    // Risk narrative
    if (analysis.riskScore >= 70) {
      summary += `Risk profile is manageable with adequate safeguards. `;
    } else if (analysis.riskScore >= 50) {
      summary += `Several risk factors require monitoring and mitigation strategies. `;
    } else {
      summary += `Multiple risk factors present. Comprehensive due diligence essential. `;
    }

    // Recommendation
    const recommendation = analysis.recommendations[0] || '';
    summary += `${recommendation}`;

    return summary;
  }
}

module.exports = PitchAnalysisService;
