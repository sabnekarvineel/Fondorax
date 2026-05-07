/**
 * Comprehensive Pitch Analysis Engine
 * Analyzes all 10 dimensions for investor-grade evaluation
 */

class ComprehensiveAnalysisEngine {
  constructor() {
    this.weights = {
      founder: 0.15,
      problem: 0.10,
      market: 0.15,
      product: 0.15,
      traction: 0.25,
      businessModel: 0.10,
      financialHealth: 0.05,
      competitive: 0.05
    };
  }

  /**
   * 1️⃣ Founder & Team Analysis (0-100)
   */
  analyzeFounderTeam(pitchData) {
    let score = 50;
    const indicators = [];
    const strengths = [];
    const weaknesses = [];

    if (pitchData.team) {
      const teamStr = pitchData.team.toLowerCase();
      
      // Experience indicators
      if (teamStr.includes('experience') || teamStr.includes('expert')) {
        score += 15;
        strengths.push('Strong industry experience');
      } else {
        weaknesses.push('Limited industry experience details');
      }

      // Co-founder indicators
      if (teamStr.includes('co-founder') || teamStr.includes('team')) {
        score += 10;
        strengths.push('Has co-founders');
      } else {
        weaknesses.push('Solo founder (higher risk)');
        score -= 10;
      }

      // Technical capability
      if (teamStr.includes('technical') || teamStr.includes('engineer') || teamStr.includes('developer')) {
        score += 10;
        strengths.push('Technical founder/team present');
      } else {
        weaknesses.push('No clear technical capability mentioned');
      }
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses,
      indicators
    };
  }

  /**
   * 2️⃣ Problem Validation Analysis (0-100)
   */
  analyzeProblemValidation(pitchData) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    if (pitchData.problem) {
      const problemStr = pitchData.problem.toLowerCase();

      // Clear problem definition
      if (pitchData.problem.length > 50) {
        score += 15;
        strengths.push('Clear problem articulation');
      } else {
        weaknesses.push('Problem statement needs clarity');
      }

      // Validation indicators
      if (problemStr.includes('customer') || problemStr.includes('user') || problemStr.includes('pain')) {
        score += 15;
        strengths.push('Customer-centric problem definition');
      } else {
        weaknesses.push('Lack of customer validation evidence');
      }

      // Frequency and intensity
      if (problemStr.includes('struggle') || problemStr.includes('challenge') || problemStr.includes('difficult')) {
        score += 10;
        strengths.push('Problem demonstrates urgency');
      }
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 3️⃣ Market Opportunity Analysis (0-100)
   */
  analyzeMarketOpportunity(pitchData) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    const marketStr = (pitchData.market_size || '').toLowerCase();

    // TAM evaluation
    if (marketStr.includes('billion') || marketStr.includes('market')) {
      score += 20;
      strengths.push('Large TAM identified');
    } else if (marketStr.includes('million')) {
      score += 10;
      strengths.push('Moderate market size');
    } else {
      weaknesses.push('Market size not clearly defined');
    }

    // Market growth
    if (marketStr.includes('grow') || marketStr.includes('expand')) {
      score += 15;
      strengths.push('Growing market');
    } else {
      weaknesses.push('Market growth potential unclear');
    }

    // Competitive clarity
    if (pitchData.competition && pitchData.competition.length > 0) {
      if (pitchData.competition.toLowerCase().includes('limited') || 
          pitchData.competition.toLowerCase().includes('emerging')) {
        score += 15;
        strengths.push('Differentiated market positioning');
      }
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 4️⃣ Product & Solution Analysis (0-100)
   */
  analyzeProductSolution(pitchData) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    // Stage evaluation
    const stage = (pitchData.stage || '').toLowerCase();
    if (stage.includes('revenue') || stage.includes('paying')) {
      score += 25;
      strengths.push('Product achieving revenue');
    } else if (stage.includes('beta') || stage.includes('customer')) {
      score += 15;
      strengths.push('Product in market testing');
    } else if (stage.includes('mvp')) {
      score += 10;
      strengths.push('MVP stage');
    } else {
      weaknesses.push('Product stage needs clarification');
    }

    // Differentiation
    if (pitchData.strengths && Array.isArray(pitchData.strengths)) {
      if (pitchData.strengths.some(s => s.toLowerCase().includes('unique') || s.toLowerCase().includes('innovative'))) {
        score += 15;
        strengths.push('Clear unique value proposition');
      }
    }

    // Scalability indicators
    if (pitchData.revenue_model && pitchData.revenue_model.includes('Subscription')) {
      score += 10;
      strengths.push('Scalable business model');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 5️⃣ Traction & Performance Analysis (0-100) - MOST IMPORTANT
   */
  analyzeTraction(traction, metrics) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    if (!traction) {
      weaknesses.push('No traction metrics provided');
      return { score: 30, strengths, weaknesses };
    }

    // Revenue traction
    const revenue = metrics?.revenue || 0;
    if (revenue > 100000) {
      score += 30;
      strengths.push('Strong revenue generation');
    } else if (revenue > 10000) {
      score += 20;
      strengths.push('Meaningful revenue');
    } else if (revenue > 0) {
      score += 10;
      strengths.push('Revenue generation started');
    } else {
      weaknesses.push('No revenue yet');
      score -= 10;
    }

    // User traction
    const users = metrics?.users || traction.indicators?.length || 0;
    if (users > 10000) {
      score += 15;
      strengths.push('Significant user base');
    } else if (users > 1000) {
      score += 10;
      strengths.push('Meaningful user adoption');
    } else if (users > 0) {
      score += 5;
      strengths.push('Initial user traction');
    } else {
      weaknesses.push('Limited user adoption');
    }

    // Growth indicators
    if (traction.indicators && traction.indicators.includes('Growth trajectory')) {
      score += 15;
      strengths.push('Demonstrated growth trajectory');
    }

    // Partnerships
    if (traction.indicators && traction.indicators.includes('Strategic partnerships')) {
      score += 10;
      strengths.push('Strategic partnerships established');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 6️⃣ Business Model Analysis (0-100)
   */
  analyzeBusinessModel(pitchData) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    if (pitchData.revenue_model) {
      const model = pitchData.revenue_model.toLowerCase();

      // Recurring vs one-time
      if (model.includes('subscription') || model.includes('recurring')) {
        score += 20;
        strengths.push('Recurring revenue model');
      } else if (model.includes('transaction') || model.includes('marketplace')) {
        score += 15;
        strengths.push('Scalable transaction model');
      }

      // Unit economics clarity
      if (model.includes('saas') || model.includes('software')) {
        score += 15;
        strengths.push('Strong unit economics potential');
      }

      // Diversification
      if (model.includes('multiple') || model.includes('streams')) {
        score += 10;
        strengths.push('Diversified revenue streams');
      }
    } else {
      weaknesses.push('Revenue model not clearly defined');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 7️⃣ Financial Health Analysis (0-100)
   */
  analyzeFinancialHealth(metrics) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];
    const redFlags = [];

    if (!metrics) {
      weaknesses.push('Financial metrics not provided');
      return { score: 40, strengths, weaknesses, redFlags };
    }

    // Runway analysis - CRITICAL
    const runway = metrics.runway || 0;
    if (runway > 18) {
      score += 20;
      strengths.push(`Healthy ${runway} month runway`);
    } else if (runway > 12) {
      score += 15;
      strengths.push(`Adequate ${runway} month runway`);
    } else if (runway > 6) {
      score += 5;
      weaknesses.push(`Limited ${runway} month runway`);
    } else if (runway > 0) {
      score -= 15;
      redFlags.push(`CRITICAL: Only ${runway} months runway remaining`);
    } else {
      score -= 25;
      redFlags.push('CRITICAL: No runway information or immediate funding needed');
    }

    // Burn rate
    const burnRate = metrics.burn || 0;
    if (burnRate === 0) {
      strengths.push('Efficient burn rate');
      score += 10;
    } else if (burnRate < 50000) {
      score += 5;
      strengths.push('Controlled burn rate');
    } else {
      weaknesses.push('High burn rate');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses,
      redFlags
    };
  }

  /**
   * 8️⃣ Risk & Red Flag Analysis (0-100, inverted)
   */
  analyzeRisks(pitchData, metrics, founderScore, tractionScore) {
    let riskScore = 70; // Start at moderate risk
    const redFlags = [];
    const greenFlags = [];

    // Founder risks
    if (founderScore < 40) {
      redFlags.push('Weak founder/team profile');
      riskScore -= 20;
    } else if (founderScore < 60) {
      redFlags.push('Team experience gaps');
      riskScore -= 10;
    } else {
      greenFlags.push('Strong founder profile');
      riskScore += 10;
    }

    // Traction risks
    if (tractionScore < 30) {
      redFlags.push('Very early stage with minimal traction');
      riskScore -= 15;
    } else if (tractionScore < 50) {
      redFlags.push('Early traction but needs validation');
      riskScore -= 10;
    } else {
      greenFlags.push('Demonstrated traction');
      riskScore += 15;
    }

    // Market risks
    if (!pitchData.market_size || pitchData.market_size.includes('Not')) {
      redFlags.push('Market size not validated');
      riskScore -= 10;
    }

    // Differentiation risks
    if (!pitchData.strengths || pitchData.strengths.length === 0) {
      redFlags.push('Unclear competitive differentiation');
      riskScore -= 10;
    }

    return {
      score: Math.min(100, Math.max(0, riskScore)),
      redFlags,
      greenFlags,
      level: riskScore >= 70 ? 'Low' : riskScore >= 50 ? 'Medium' : 'High'
    };
  }

  /**
   * 9️⃣ Competitive Position Analysis (0-100)
   */
  analyzeCompetitivePosition(pitchData) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    if (pitchData.competition) {
      const comp = pitchData.competition.toLowerCase();

      // Limited competition = good
      if (comp.includes('limited') || comp.includes('emerging') || comp.includes('new')) {
        score += 20;
        strengths.push('Emerging market with limited competitors');
      } else if (comp.includes('established') || comp.includes('crowded')) {
        score -= 15;
        weaknesses.push('Crowded competitive landscape');
      }
    }

    // Product differentiation
    if (pitchData.strengths && pitchData.strengths.length > 0) {
      score += 15;
      strengths.push('Clear competitive advantages identified');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * 🔟 Investment Readiness Analysis (0-100)
   */
  analyzeInvestmentReadiness(pitchData, allScores) {
    let score = 50;
    const strengths = [];
    const weaknesses = [];

    // Stage maturity
    const stage = (pitchData.stage || '').toLowerCase();
    if (stage.includes('series') || stage.includes('growth')) {
      score += 20;
      strengths.push('Late-stage with clear path');
    } else if (stage.includes('seed') || stage.includes('series a')) {
      score += 15;
      strengths.push('Series-ready stage');
    }

    // Data transparency
    if (pitchData.problem && pitchData.market_size && pitchData.revenue_model) {
      score += 15;
      strengths.push('Good data transparency');
    } else {
      weaknesses.push('Missing key financial or market data');
    }

    // Overall readiness
    const avgScore = Object.values(allScores).reduce((a, b) => a + b, 0) / Object.keys(allScores).length;
    if (avgScore > 70) {
      strengths.push('Overall strong investment profile');
      score += 10;
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      strengths,
      weaknesses
    };
  }

  /**
   * Generate Comprehensive Report
   */
  generateComprehensiveReport(pitchData, metrics = {}) {
    // Ensure pitchData exists
    if (!pitchData || typeof pitchData !== 'object') {
      console.warn("Invalid pitchData provided to comprehensive analysis", pitchData);
      pitchData = {};
    }

    console.log("🔍 Analyzing pitchData:", {
      hasProblem: !!pitchData.problem,
      hasTeam: !!pitchData.team,
      hasMarket: !!pitchData.market_size,
      hasProduct: !!pitchData.product,
      hasTraction: !!pitchData.traction,
    });

    // Analyze all 10 dimensions
    const founder = this.analyzeFounderTeam(pitchData);
    const problem = this.analyzeProblemValidation(pitchData);
    const market = this.analyzeMarketOpportunity(pitchData);
    const product = this.analyzeProductSolution(pitchData);
    const traction = this.analyzeTraction(pitchData.traction, metrics);
    const businessModel = this.analyzeBusinessModel(pitchData);
    const financial = this.analyzeFinancialHealth(metrics);
    const competitive = this.analyzeCompetitivePosition(pitchData);

    console.log("✅ Dimension Analysis Complete:", {
      founder: founder.score,
      problem: problem.score,
      market: market.score,
      product: product.score,
      traction: traction.score,
      businessModel: businessModel.score,
      financial: financial.score,
      competitive: competitive.score
    });
    const risks = this.analyzeRisks(pitchData, metrics, founder.score, traction.score);
    const readiness = this.analyzeInvestmentReadiness(pitchData, {
      founder: founder.score,
      problem: problem.score,
      market: market.score,
      product: product.score,
      traction: traction.score,
      businessModel: businessModel.score,
      financial: financial.score,
      competitive: competitive.score
    });

    // Calculate weighted overall score
    const scores = {
      founder: founder.score,
      problem: problem.score,
      market: market.score,
      product: product.score,
      traction: traction.score,
      businessModel: businessModel.score,
      financial: financial.score,
      competitive: competitive.score,
      readiness: readiness.score
    };

    const overallScore = Math.round(
      founder.score * 0.15 +
      problem.score * 0.10 +
      market.score * 0.15 +
      product.score * 0.15 +
      traction.score * 0.25 +
      businessModel.score * 0.10 +
      financial.score * 0.05 +
      competitive.score * 0.05
    );

    // Collect all insights
    const strengths = [
      ...founder.strengths,
      ...problem.strengths,
      ...market.strengths,
      ...product.strengths,
      ...traction.strengths,
      ...businessModel.strengths,
      ...competitive.strengths
    ];

    const weaknesses = [
      ...founder.weaknesses,
      ...problem.weaknesses,
      ...market.weaknesses,
      ...product.weaknesses,
      ...traction.weaknesses,
      ...businessModel.weaknesses,
      ...financial.weaknesses,
      ...competitive.weaknesses
    ];

    const redFlags = [
      ...financial.redFlags,
      ...risks.redFlags
    ];

    // Investment recommendation
    let recommendation = 'N/A';
    if (overallScore >= 80) {
      recommendation = 'STRONG BUY - Excellent investment opportunity with strong fundamentals across all dimensions.';
    } else if (overallScore >= 70) {
      recommendation = 'BUY - Good investment opportunity. Address identified risk areas before final commitment.';
    } else if (overallScore >= 60) {
      recommendation = 'HOLD - Moderate opportunity with potential. Requires deeper due diligence and validation.';
    } else if (overallScore >= 50) {
      recommendation = 'PASS with OPTION - Early stage with execution risk. Consider revisiting in future funding rounds.';
    } else {
      recommendation = 'PASS - Significant concerns across multiple dimensions. Not ready for investment.';
    }

    return {
      overallScore,
      riskLevel: risks.level,
      recommendation,
      scores,
      analyses: {
        founder,
        problem,
        market,
        product,
        traction,
        businessModel,
        financial,
        competitive,
        readiness
      },
      strengths: [...new Set(strengths)].slice(0, 10),
      weaknesses: [...new Set(weaknesses)].slice(0, 10),
      redFlags: [...new Set(redFlags)],
      greenFlags: risks.greenFlags
    };
  }
}

module.exports = new ComprehensiveAnalysisEngine();
