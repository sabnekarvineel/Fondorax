/**
 * Hybrid Scoring Engine
 * Combines rule-based quantitative metrics with AI qualitative insights
 */

/**
 * Calculate Founder/Team Score
 * Based on: experience, track record, clarity in pitch
 */
function calculateFounderScore(aiData, financials) {
  let score = 50; // Base score

  // Positive indicators
  if (aiData.team) {
    // If AI found team information, founder mentioned positively
    score += 15;
  }

  // Traction indicators (proxy for founder execution)
  if (financials?.annualRevenue > 0) {
    score += 20;
  }

  if (financials?.growthRate >= 50) {
    score += 15; // High growth shows execution
  }

  if (financials?.activeUsers > 1000) {
    score += 10;
  }

  // Cap score
  return Math.min(score, 100);
}

/**
 * Calculate Market Score
 * Based on: market size, competitive positioning, revenue model clarity
 */
function calculateMarketScore(aiData) {
  let score = 40; // Base score

  // Market size indicators
  const marketSize = aiData.market_size?.toLowerCase() || "";

  if (
    marketSize.includes("billion") ||
    marketSize.includes("trillion") ||
    marketSize.includes("$10b")
  ) {
    score += 30; // Large market
  } else if (
    marketSize.includes("million") ||
    marketSize.includes("$100m")
  ) {
    score += 20; // Medium market
  } else if (marketSize.length > 0) {
    score += 10; // Market mentioned but size unclear
  }

  // Revenue model clarity
  if (aiData.revenue_model && aiData.revenue_model.length > 50) {
    score += 15; // Clear revenue model
  } else if (aiData.revenue_model) {
    score += 5; // Some revenue model
  }

  // Competition consideration
  if (
    aiData.competition &&
    aiData.competition.toLowerCase().includes("differentiat")
  ) {
    score += 15; // Clear differentiation
  } else if (aiData.competition) {
    score += 5;
  }

  return Math.min(score, 100);
}

/**
 * Calculate Traction Score
 * Based on: revenue, growth rate, users, runway
 */
function calculateTractionScore(financials) {
  let score = 30; // Base score

  if (!financials) {
    return score;
  }

  // Revenue milestone achievements
  if (financials.annualRevenue >= 1000000) {
    score += 35; // $1M+ ARR
  } else if (financials.annualRevenue >= 500000) {
    score += 25; // $500K+ ARR
  } else if (financials.annualRevenue >= 100000) {
    score += 15; // $100K+ ARR
  } else if (financials.annualRevenue > 0) {
    score += 8; // Early revenue
  }

  // Growth rate bonus
  if (financials.growthRate >= 50) {
    score += 20; // 50%+ monthly growth
  } else if (financials.growthRate >= 20) {
    score += 12;
  } else if (financials.growthRate >= 10) {
    score += 6;
  }

  // User metrics
  if (financials.activeUsers >= 100000) {
    score += 15;
  } else if (financials.activeUsers >= 10000) {
    score += 10;
  } else if (financials.activeUsers >= 1000) {
    score += 5;
  }

  // Runway - how long they can operate
  if (financials.runwayMonths >= 24) {
    score += 10; // Good runway
  } else if (financials.runwayMonths >= 12) {
    score += 5;
  } else if (financials.runwayMonths < 6) {
    score -= 10; // Risk: low runway
  }

  return Math.min(score, 100);
}

/**
 * Calculate Finance Score
 * Based on unit economics and financial health
 */
function calculateFinanceScore(financials) {
  let score = 40;

  if (!financials) {
    return score;
  }

  // LTV:CAC ratio (target: 3:1 or higher)
  if (financials.ltv && financials.cac) {
    const ratio = financials.ltv / financials.cac;
    if (ratio >= 3) {
      score += 30;
    } else if (ratio >= 2) {
      score += 20;
    } else if (ratio >= 1) {
      score += 10;
    }
  }

  // Churn rate (lower is better, target <5%)
  if (financials.churnRate !== null && financials.churnRate !== undefined) {
    if (financials.churnRate <= 5) {
      score += 20;
    } else if (financials.churnRate <= 10) {
      score += 10;
    } else if (financials.churnRate > 10) {
      score -= 10;
    }
  }

  // Burn rate relative to runway
  if (
    financials.monthlyBurn &&
    financials.runwayMonths &&
    financials.annualRevenue
  ) {
    const burnToRevenueRatio = financials.monthlyBurn / (financials.annualRevenue / 12);
    if (burnToRevenueRatio < 3) {
      score += 15; // Reasonable burn
    } else if (burnToRevenueRatio > 10) {
      score -= 15; // Excessive burn
    }
  }

  return Math.min(score, 100);
}

/**
 * Calculate Risk Score (inverted)
 * Lower score = higher risk
 */
function calculateRiskScore(aiData, financials) {
  let score = 70; // Start with decent score

  // Count risk factors identified by AI
  const riskCount = aiData.risks?.length || 0;
  if (riskCount > 5) {
    score -= 20; // Many risks
  } else if (riskCount > 2) {
    score -= 10;
  }

  // Market risk indicators
  const risks = (aiData.risks || []).join(" ").toLowerCase();
  if (risks.includes("competition") || risks.includes("compete")) {
    score -= 10;
  }
  if (risks.includes("regulation") || risks.includes("regulatory")) {
    score -= 15;
  }
  if (risks.includes("technology") || risks.includes("technical")) {
    score -= 8;
  }

  // Financial risk indicators
  if (financials?.runwayMonths && financials.runwayMonths < 6) {
    score -= 20; // Critical runway risk
  }

  if (financials?.monthlyBurn && financials?.annualRevenue) {
    const burnToRevenue = financials.monthlyBurn / (financials.annualRevenue / 12);
    if (burnToRevenue > 15) {
      score -= 25; // Unsustainable burn
    }
  }

  return Math.max(score, 0);
}

/**
 * Determine Risk Level (High, Medium, Low, Critical)
 */
function determineRiskLevel(riskScore) {
  if (riskScore >= 70) {
    return "Low";
  } else if (riskScore >= 50) {
    return "Medium";
  } else if (riskScore >= 30) {
    return "High";
  } else {
    return "Critical";
  }
}

/**
 * Calculate weighted total score
 * Weights are tuned for balanced evaluation
 */
function calculateTotalScore(scores) {
  const weights = {
    founder: 0.2, // 20%
    market: 0.25, // 25%
    traction: 0.25, // 25%
    finance: 0.15, // 15%
    risk: 0.15, // 15%
  };

  const total =
    scores.founderScore * weights.founder +
    scores.marketScore * weights.market +
    scores.tractionScore * weights.traction +
    scores.financeScore * weights.finance +
    scores.riskScore * weights.risk;

  return Math.round(total);
}

/**
 * Main scoring function - orchestrates all scores
 */
function scoreStartup(aiData, financials) {
  const scores = {
    founderScore: calculateFounderScore(aiData, financials),
    marketScore: calculateMarketScore(aiData),
    tractionScore: calculateTractionScore(financials),
    financeScore: calculateFinanceScore(financials),
    riskScore: calculateRiskScore(aiData, financials),
  };

  const totalScore = calculateTotalScore(scores);
  const riskLevel = determineRiskLevel(scores.riskScore);

  return {
    ...scores,
    totalScore,
    riskLevel,
    recommendation: getRecommendation(totalScore, riskLevel),
  };
}

/**
 * Generate investment recommendation based on scores
 */
function getRecommendation(totalScore, riskLevel) {
  if (totalScore >= 80 && riskLevel === "Low") {
    return "Strong Buy";
  } else if (totalScore >= 70 && riskLevel !== "Critical") {
    return "Buy";
  } else if (totalScore >= 60 && riskLevel === "Low") {
    return "Consider";
  } else if (totalScore >= 50 && riskLevel === "Medium") {
    return "Hold / Due Diligence";
  } else if (riskLevel === "Critical") {
    return "High Risk - Caution";
  } else {
    return "Pass";
  }
}

/**
 * Comparison metrics - show progress
 */
function getComparisonMetrics(previousAnalysis, currentAnalysis) {
  if (!previousAnalysis) {
    return {
      scoreChange: 0,
      percentageChange: 0,
      improvementAreas: [],
      declinedAreas: [],
    };
  }

  const scoreChange = currentAnalysis.totalScore - previousAnalysis.totalScore;
  const percentageChange = ((scoreChange / previousAnalysis.totalScore) * 100).toFixed(2);

  const improvementAreas = [];
  const declinedAreas = [];

  if (
    currentAnalysis.founderScore > previousAnalysis.founderScore
  ) {
    improvementAreas.push("Founder/Team");
  } else if (currentAnalysis.founderScore < previousAnalysis.founderScore) {
    declinedAreas.push("Founder/Team");
  }

  if (currentAnalysis.tractionScore > previousAnalysis.tractionScore) {
    improvementAreas.push("Traction");
  } else if (currentAnalysis.tractionScore < previousAnalysis.tractionScore) {
    declinedAreas.push("Traction");
  }

  if (currentAnalysis.marketScore > previousAnalysis.marketScore) {
    improvementAreas.push("Market");
  } else if (currentAnalysis.marketScore < previousAnalysis.marketScore) {
    declinedAreas.push("Market");
  }

  return {
    scoreChange,
    percentageChange,
    improvementAreas,
    declinedAreas,
  };
}

module.exports = {
  scoreStartup,
  calculateFounderScore,
  calculateMarketScore,
  calculateTractionScore,
  calculateFinanceScore,
  calculateRiskScore,
  determineRiskLevel,
  calculateTotalScore,
  getComparisonMetrics,
};
