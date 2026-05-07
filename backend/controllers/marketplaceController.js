const Marketplace = require('../models/Marketplace');
const Deal = require('../models/Deal');
const ValuationService = require('../services/valuationService');

/**
 * Create a new listing
 * POST /api/marketplace/listings
 */
exports.createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      industry,
      monthlyRevenue = 0,
      growthRate = 0,
      askingPrice,
      location,
      customerCount,
      churnRate,
      techStack = [],
      assetType = 'Equity',
      exitType,
      equityOffered
    } = req.body;

    // Validate required fields
    if (!title || !askingPrice) {
      return res.status(400).json({
        error: 'Missing required fields: title, askingPrice'
      });
    }

    // For non-Whole Company assets, revenue is helpful but optional for listing creation
    // Validate valuation data only if monthlyRevenue is provided
    if (monthlyRevenue > 0) {
      const validation = ValuationService.validateListingForValuation({
        monthlyRevenue,
        askingPrice,
        industry: industry || 'Other',
        growthRate,
        churnRate
      });

      if (!validation.isValid) {
        return res.status(400).json({
          error: 'Validation failed',
          details: validation.errors
        });
      }
    }

    // Calculate valuation if revenue is provided
    const valuation = monthlyRevenue > 0 
      ? ValuationService.calculateValuation(
          monthlyRevenue,
          growthRate,
          industry || 'Other'
        )
      : null;

    // Get user details from JWT token
    const userId = req.user.userId; // JWT stores userId, not _id
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Fetch user from database to get full details
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create listing
    const listing = new Marketplace({
      founderId: userId,
      title,
      description,
      industry: industry || 'Other',
      monthlyRevenue: parseInt(monthlyRevenue) || 0,
      monthlyRecurringRevenue: parseInt(monthlyRevenue) || 0,
      annualRevenue: (parseInt(monthlyRevenue) || 0) * 12,
      growthRate: parseInt(growthRate) || 0,
      askingPrice: parseInt(askingPrice),
      location,
      customerCount: customerCount ? parseInt(customerCount) : 0,
      churnRate: churnRate ? parseInt(churnRate) : 0,
      techStack: Array.isArray(techStack) ? techStack : (techStack ? techStack.split(',').map(t => t.trim()) : []),
      valuationScore: valuation,
      assetType: assetType || 'Equity',
      exitType: exitType || 'partial',
      equityOffered: equityOffered ? parseFloat(equityOffered) : null,
      founder: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        verified: user.verified
      },
      status: 'active',
      dealStatus: 'none'
    });

    await listing.save();

    // Populate founder info
    const populatedListing = await Marketplace.findById(listing._id)
      .populate('founderId', 'firstName lastName email verified');

    res.status(201).json({
      message: 'Listing created successfully',
      listing: populatedListing
    });
  } catch (err) {
    console.error('Error creating listing:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all listings with filters
 * GET /api/marketplace/listings
 */
exports.getListings = async (req, res) => {
  try {
    const {
      search,
      industry,
      revenueMin,
      revenueMax,
      growthRateMin,
      verified,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build filter
    let filter = { status: 'active' };

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Industry filter
    if (industry && industry !== 'all') {
      filter.industry = industry;
    }

    // Revenue range filter
    if (revenueMin || revenueMax) {
      filter.monthlyRevenue = {};
      if (revenueMin) {
        filter.monthlyRevenue.$gte = parseInt(revenueMin);
      }
      if (revenueMax) {
        filter.monthlyRevenue.$lte = parseInt(revenueMax);
      }
    }

    // Growth rate filter
    if (growthRateMin) {
      filter.growthRate = { $gte: parseInt(growthRateMin) };
    }

    // Verified filter
    if (verified === 'true') {
      filter.revenueVerified = true;
    }

    // Build sort
    let sort = { createdAt: -1 };
    switch (sortBy) {
      case 'highest_revenue':
        sort = { monthlyRevenue: -1 };
        break;
      case 'highest_growth':
        sort = { growthRate: -1 };
        break;
      case 'lowest_price':
        sort = { askingPrice: 1 };
        break;
      case 'most_viewed':
        sort = { views: -1 };
        break;
      case 'newest':
      default:
        sort = { createdAt: -1 };
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const listings = await Marketplace.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate('founderId', 'firstName lastName email verified');

    // Count total
    const total = await Marketplace.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      listings,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalListings: total,
        limit: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get single listing details
 * GET /api/marketplace/listings/:id
 */
exports.getSingleListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Marketplace.findById(id)
      .populate('founderId', 'firstName lastName email verified')
      .populate('interests.buyerId', 'firstName lastName email');

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Increment views
    listing.views = (listing.views || 0) + 1;
    await listing.save();

    res.json(listing);
  } catch (err) {
    console.error('Error fetching listing:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update listing
 * PUT /api/marketplace/listings/:id
 */
exports.updateListing = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const listing = await Marketplace.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Not authorized to update this listing'
      });
    }

    // Recalculate valuation if revenue or growth changed
    if (updates.monthlyRevenue || updates.growthRate) {
      const newRevenue = updates.monthlyRevenue || listing.monthlyRevenue;
      const newGrowth = updates.growthRate !== undefined ? updates.growthRate : listing.growthRate;
      const newIndustry = updates.industry || listing.industry;

      const valuation = ValuationService.calculateValuation(
        newRevenue,
        newGrowth,
        newIndustry
      );

      listing.valuationScore = valuation;
    }

    // Update fields
    Object.assign(listing, updates);
    listing.updatedAt = new Date();

    await listing.save();

    const updated = await Marketplace.findById(id)
      .populate('founderId', 'firstName lastName email verified');

    res.json({
      message: 'Listing updated successfully',
      listing: updated
    });
  } catch (err) {
    console.error('Error updating listing:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete listing
 * DELETE /api/marketplace/listings/:id
 */
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Marketplace.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check ownership
    if (listing.founderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: 'Not authorized to delete this listing'
      });
    }

    // Delete associated deals
    await Deal.deleteMany({ listingId: id });

    // Delete listing
    await Marketplace.findByIdAndDelete(id);

    res.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Save listing to wishlist
 * POST /api/marketplace/listings/:id/save
 */
exports.saveListing = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const listing = await Marketplace.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if already saved
    const alreadySaved = listing.saves.some(
      saveId => saveId.toString() === userId.toString()
    );

    if (alreadySaved) {
      // Remove from saves
      listing.saves = listing.saves.filter(
        saveId => saveId.toString() !== userId.toString()
      );
      listing.savedCount = Math.max(0, listing.savedCount - 1);
    } else {
      // Add to saves
      listing.saves.push(userId);
      listing.savedCount = (listing.savedCount || 0) + 1;
    }

    await listing.save();

    res.json({
      message: alreadySaved ? 'Listing removed from saves' : 'Listing saved successfully',
      listing
    });
  } catch (err) {
    console.error('Error saving listing:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get user's saved listings
 * GET /api/marketplace/saved
 */
exports.getSavedListings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 12 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    const listings = await Marketplace.find({
      saves: userId,
      status: 'active'
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('founderId', 'firstName lastName email verified');

    const total = await Marketplace.countDocuments({
      saves: userId,
      status: 'active'
    });

    res.json({
      listings,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalListings: total,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error fetching saved listings:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get valuation for a listing
 * GET /api/marketplace/listings/:id/valuation
 */
exports.getValuation = async (req, res) => {
  try {
    const { id } = req.params;

    const listing = await Marketplace.findById(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Generate detailed valuation report
    const report = ValuationService.generateValuationReport({
      title: listing.title,
      industry: listing.industry,
      monthlyRevenue: listing.monthlyRevenue,
      growthRate: listing.growthRate,
      askingPrice: listing.askingPrice,
      customerCount: listing.customerCount,
      churnRate: listing.churnRate
    });

    res.json(report);
  } catch (err) {
    console.error('Error getting valuation:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Calculate valuation (for preview before listing)
 * POST /api/marketplace/valuations/calculate
 */
exports.calculateValuation = async (req, res) => {
  try {
    const {
      monthlyRevenue,
      growthRate = 0,
      industry,
      customerCount,
      churnRate
    } = req.body;

    // Validate
    const validation = ValuationService.validateListingForValuation({
      monthlyRevenue,
      askingPrice: 1, // dummy value for validation
      industry,
      growthRate,
      churnRate
    });

    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.errors
      });
    }

    // Calculate valuation
    const valuation = ValuationService.calculateAdvancedValuation({
      monthlyRevenue,
      growthRate,
      industry,
      customerCount,
      churnRate
    });

    res.json({
      success: true,
      valuation,
      insights: {
        roi: `Potential ${((valuation.totalValue - monthlyRevenue * 12) / (monthlyRevenue * 12) * 100).toFixed(1)}% ROI based on valuation`,
        recommendation: 'Use this estimated value as pricing guidance'
      }
    });
  } catch (err) {
    console.error('Error calculating valuation:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get filter options (industries, locations, etc)
 * GET /api/marketplace/filters/options
 */
exports.getFilterOptions = async (req, res) => {
  try {
    const industries = [
      'SaaS',
      'AI/ML',
      'FinTech',
      'E-commerce',
      'EdTech',
      'HealthTech',
      'MarTech',
      'Mobile App',
      'Other'
    ];

    // Get actual locations from database
    const locations = await Marketplace.distinct('location', {
      status: 'active',
      location: { $ne: null }
    });

    // Get revenue stats
    const stats = await Marketplace.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: null,
          minRevenue: { $min: '$monthlyRevenue' },
          maxRevenue: { $max: '$monthlyRevenue' },
          avgRevenue: { $avg: '$monthlyRevenue' },
          totalListings: { $sum: 1 },
          verifiedCount: {
            $sum: { $cond: ['$revenueVerified', 1, 0] }
          }
        }
      }
    ]);

    res.json({
      industries,
      locations: locations.filter(l => l).sort(),
      stats: stats.length > 0 ? stats[0] : {
        minRevenue: 0,
        maxRevenue: 0,
        avgRevenue: 0,
        totalListings: 0,
        verifiedCount: 0
      }
    });
  } catch (err) {
    console.error('Error fetching filter options:', err);
    res.status(500).json({ error: err.message });
  }
};
