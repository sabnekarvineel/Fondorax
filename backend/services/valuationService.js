/**
 * Micro-Exit Marketplace Valuation Service
 * Calculates automated valuation scores for listings
 */

class ValuationService {
  /**
   * Calculate valuation based on industry multiplier & growth
   * 
   * Formula:
   * Base Value = Monthly Revenue × 12 × Industry Multiple
   * Growth Bonus = Base Value × (Growth Rate / 100) × 0.5
   * Total Value = Base Value + Growth Bonus
   */
  static calculateValuation(monthlyRevenue, growthRate, industry) {
    // Industry-based revenue multipliers
    const multipliers = {
      'SaaS': { min: 4, max: 6, default: 4.5 },
      'AI/ML': { min: 5, max: 7, default: 5.5 },
      'FinTech': { min: 3.5, max: 5.5, default: 4 },
      'E-commerce': { min: 1.5, max: 3.5, default: 2.5 },
      'Mobile App': { min: 2.5, max: 4.5, default: 3.5 },
      'HealthTech': { min: 3, max: 5, default: 4 },
      'MarTech': { min: 2.5, max: 4.5, default: 3.5 },
      'EdTech': { min: 2.5, max: 4.5, default: 3.5 },
      'Other': { min: 2, max: 4, default: 3 }
    };

    const multiplier = multipliers[industry]?.default || multipliers['Other'].default;

    // Calculate base valuation (annualized revenue × multiplier)
    const baseValue = (monthlyRevenue * 12) * multiplier;

    // Growth bonus (0-100% growth gets bonus)
    const growthBonus = baseValue * (growthRate / 100) * 0.5;

    // Total valuation
    const totalValue = baseValue + growthBonus;

    return {
      baseValue: Math.round(baseValue),
      growthBonus: Math.round(growthBonus),
      totalValue: Math.round(totalValue),
      multiple: multiplier,
      calculatedAt: new Date()
    };
  }

  /**
   * Calculate valuation with extended metrics
   * Factors in: customers, churn rate, customer acquisition cost
   */
  static calculateAdvancedValuation(listing) {
    const { monthlyRevenue, growthRate, industry, customerCount, churnRate } = listing;

    // Base valuation
    const baseValuation = this.calculateValuation(monthlyRevenue, growthRate, industry);

    // Customer metrics adjustments
    let adjustmentFactor = 1;

    // High customer count = lower churn risk (positive adjustment)
    if (customerCount && customerCount > 100) {
      adjustmentFactor += 0.05; // +5% adjustment
    }

    // High churn rate = negative adjustment
    if (churnRate && churnRate > 10) {
      adjustmentFactor -= Math.min(churnRate / 100, 0.2); // Max -20% adjustment
    }

    // Apply adjustment
    const adjustedValue = Math.round(baseValuation.totalValue * adjustmentFactor);

    return {
      ...baseValuation,
      totalValue: adjustedValue,
      adjustmentFactor,
      customerMetrics: {
        customerCount,
        churnRate,
        estimatedLTV: monthlyRevenue / Math.max(customerCount, 1)
      }
    };
  }

  /**
   * Calculate deal multiples based on asking price vs valuation
   * Shows if listing is overpriced or underpriced
   */
  static calculateDealMetrics(monthlyRevenue, askingPrice, industry) {
    const valuation = this.calculateValuation(monthlyRevenue, 0, industry); // No growth bonus for comparison
    
    const priceToValueRatio = (askingPrice / valuation.totalValue) * 100;
    const discount = priceToValueRatio < 100;
    const percentage = Math.abs(100 - priceToValueRatio);

    return {
      estimatedValue: valuation.totalValue,
      askingPrice,
      priceToValueRatio: Math.round(priceToValueRatio),
      discount: {
        isDiscount: discount,
        percentage: Math.round(percentage),
        label: discount ? `${percentage}% DISCOUNT` : `${percentage}% PREMIUM`
      },
      recommendation: this.getValueRecommendation(priceToValueRatio)
    };
  }

  /**
   * Get investment recommendation based on price-to-value ratio
   */
  static getValueRecommendation(ratio) {
    if (ratio < 75) return { status: 'excellent', message: 'Excellent deal - Highly undervalued' };
    if (ratio < 85) return { status: 'great', message: 'Great deal - Well undervalued' };
    if (ratio < 100) return { status: 'good', message: 'Good deal - Reasonable price' };
    if (ratio < 115) return { status: 'fair', message: 'Fair deal - Slightly premium' };
    if (ratio < 130) return { status: 'expensive', message: 'Expensive - Significantly premium' };
    return { status: 'very-expensive', message: 'Very expensive - Overvalued' };
  }

  /**
   * Calculate platform commission
   */
  static calculateCommission(dealValue, commissionPercent = 3) {
    return {
      dealValue,
      commissionPercent,
      commissionAmount: Math.round((dealValue * commissionPercent) / 100),
      buyerReceives: dealValue - Math.round((dealValue * commissionPercent) / 100)
    };
  }

  /**
   * Validate listing data for valuation
   */
  static validateListingForValuation(listing) {
    const errors = [];

    if (!listing.monthlyRevenue || listing.monthlyRevenue <= 0) {
      errors.push('Monthly revenue must be greater than 0');
    }

    if (!listing.askingPrice || listing.askingPrice <= 0) {
      errors.push('Asking price must be greater than 0');
    }

    if (!listing.industry) {
      errors.push('Industry must be specified');
    }

    if (listing.growthRate < 0 || listing.growthRate > 1000) {
      errors.push('Growth rate must be between 0 and 1000%');
    }

    if (listing.churnRate && (listing.churnRate < 0 || listing.churnRate > 100)) {
      errors.push('Churn rate must be between 0 and 100%');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate valuation report for a listing
   */
  static generateValuationReport(listing) {
    const validation = this.validateListingForValuation(listing);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    const valuation = this.calculateAdvancedValuation(listing);
    const dealMetrics = this.calculateDealMetrics(
      listing.monthlyRevenue,
      listing.askingPrice,
      listing.industry
    );
    const commission = this.calculateCommission(listing.askingPrice);

    return {
      success: true,
      listing: {
        title: listing.title,
        industry: listing.industry,
        monthlyRevenue: listing.monthlyRevenue,
        growthRate: listing.growthRate
      },
      valuation,
      dealMetrics,
      commission,
      insights: {
        priceStrategy: dealMetrics.recommendation,
        valuationMultiple: `${valuation.multiple}x annual revenue`,
        roi: `Potential ${((dealMetrics.estimatedValue - listing.askingPrice) / listing.askingPrice * 100).toFixed(1)}% ROI if listing reaches estimated valuation`,
        recommendation: this.getInvestmentRecommendation(valuation, dealMetrics, listing)
      },
      generatedAt: new Date()
    };
  }

  /**
   * Get investment recommendation based on multiple factors
   */
  static getInvestmentRecommendation(valuation, dealMetrics, listing) {
    let score = 0;
    const factors = [];

    // Growth rate factor (higher is better)
    if (listing.growthRate > 20) {
      score += 3;
      factors.push('✓ Strong growth rate');
    } else if (listing.growthRate > 10) {
      score += 2;
      factors.push('✓ Moderate growth rate');
    }

    // Price-to-value factor
    if (dealMetrics.discount.isDiscount && dealMetrics.discount.percentage > 20) {
      score += 3;
      factors.push('✓ Excellent valuation discount');
    } else if (dealMetrics.discount.isDiscount) {
      score += 2;
      factors.push('✓ Good valuation');
    }

    // Revenue stability (churn rate)
    if (listing.churnRate && listing.churnRate < 5) {
      score += 2;
      factors.push('✓ Excellent customer retention');
    } else if (listing.churnRate && listing.churnRate < 10) {
      score += 1;
      factors.push('✓ Good customer retention');
    }

    // Customer base
    if (listing.customerCount && listing.customerCount > 500) {
      score += 2;
      factors.push('✓ Large customer base');
    } else if (listing.customerCount && listing.customerCount > 100) {
      score += 1;
      factors.push('✓ Healthy customer base');
    }

    // Revenue level
    if (listing.monthlyRevenue > 500000) {
      score += 2;
      factors.push('✓ High revenue');
    } else if (listing.monthlyRevenue > 100000) {
      score += 1;
      factors.push('✓ Decent revenue');
    }

    // Determine recommendation tier
    let recommendation = 'HOLD - Review more carefully';
    if (score >= 10) recommendation = 'STRONG BUY - Excellent opportunity';
    else if (score >= 7) recommendation = 'BUY - Good opportunity';
    else if (score >= 4) recommendation = 'CONSIDER - Mixed signals';

    return {
      score,
      maxScore: 11,
      recommendation,
      factors
    };
  }
}

module.exports = ValuationService;
