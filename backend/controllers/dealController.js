const Deal = require('../models/Deal');
const Marketplace = require('../models/Marketplace');

/**
 * Express interest in a listing
 * POST /api/deals/express-interest/:listingId
 */
exports.expressInterest = async (req, res) => {
  try {
    const { listingId } = req.params;
    const buyerId = req.user._id;

    // Get listing
    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Can't express interest in own listing
    if (listing.founderId.toString() === buyerId.toString()) {
      return res.status(400).json({
        error: 'You cannot express interest in your own listing'
      });
    }

    // Check if already interested
    const existingDeal = await Deal.findOne({
      listingId,
      buyerId,
      status: { $ne: 'cancelled' }
    });

    if (existingDeal) {
      return res.status(409).json({
        error: 'You have already expressed interest in this listing'
      });
    }

    // Create deal
    const deal = new Deal({
      listingId,
      buyerId,
      sellerId: listing.founderId,
      status: 'interested',
      listingPrice: listing.askingPrice
    });

    await deal.save();

    // Update listing - add to interests array
    listing.interests.push({
      buyerId,
      stage: 'interested',
      interestedAt: new Date()
    });
    listing.interestCount = (listing.interestCount || 0) + 1;
    
    // Update deal status
    if (!listing.dealStatus || listing.dealStatus === 'none') {
      listing.dealStatus = 'interest_received';
    }

    await listing.save();

    // Populate and return
    const populatedDeal = await Deal.findById(deal._id)
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email')
      .populate('listingId', 'title monthlyRevenue askingPrice');

    res.status(201).json({
      message: 'Interest expressed successfully',
      deal: populatedDeal
    });
  } catch (err) {
    console.error('Error expressing interest:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get my interests (for buyer dashboard)
 * GET /api/deals/my-interests
 */
exports.getMyInterests = async (req, res) => {
  try {
    const buyerId = req.user._id;
    const { status, page = 1, limit = 12 } = req.query;

    // Build filter
    let filter = { buyerId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Query
    const deals = await Deal.find(filter)
      .sort({ interestedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('listingId', 'title monthlyRevenue askingPrice valuationScore')
      .populate('sellerId', 'firstName lastName email verified');

    const total = await Deal.countDocuments(filter);

    res.json({
      deals,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalDeals: total,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error fetching interests:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get interests received (for seller dashboard)
 * GET /api/deals/interests-received/:listingId
 */
exports.getInterestsReceived = async (req, res) => {
  try {
    const { listingId } = req.params;
    const sellerId = req.user._id;
    const { status, page = 1, limit = 12 } = req.query;

    // Verify listing belongs to seller
    const listing = await Marketplace.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.founderId.toString() !== sellerId.toString()) {
      return res.status(403).json({
        error: 'Not authorized to view interests for this listing'
      });
    }

    // Build filter
    let filter = { listingId, sellerId };
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Query
    const deals = await Deal.find(filter)
      .sort({ interestedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('buyerId', 'firstName lastName email verified');

    const total = await Deal.countDocuments(filter);

    res.json({
      deals,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalInterests: total,
        limit: limitNum
      }
    });
  } catch (err) {
    console.error('Error fetching interests received:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get deal details
 * GET /api/deals/:dealId
 */
exports.getDealDetails = async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId)
      .populate('listingId')
      .populate('buyerId', 'firstName lastName email verified')
      .populate('sellerId', 'firstName lastName email verified');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization (buyer or seller)
    if (deal.buyerId._id.toString() !== userId.toString() &&
        deal.sellerId._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized to view this deal' });
    }

    res.json(deal);
  } catch (err) {
    console.error('Error fetching deal:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update deal status
 * PUT /api/deals/:dealId/status
 */
exports.updateDealStatus = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { status, notes } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    const isBuyer = deal.buyerId.toString() === userId.toString();
    const isSeller = deal.sellerId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Valid status transitions
    const validStatuses = ['interested', 'nda_pending', 'nda_signed', 'due_diligence', 'negotiating', 'closed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Update deal
    deal.status = status;
    if (notes) {
      if (isBuyer) {
        deal.buyerNotes = notes;
      } else {
        deal.sellerNotes = notes;
      }
    }

    // Update timestamps based on status
    if (status === 'nda_pending') {
      deal.ndaSentAt = new Date();
    } else if (status === 'nda_signed') {
      deal.ndaSignedAt = new Date();
    } else if (status === 'due_diligence') {
      deal.dueDiligenceStartedAt = new Date();
    } else if (status === 'negotiating') {
      deal.negotiationStartedAt = new Date();
    } else if (status === 'closed') {
      deal.closedAt = new Date();
    }

    await deal.save();

    // Update listing deal status
    const listing = await Marketplace.findById(deal.listingId);
    if (listing) {
      // Map deal status to listing deal status
      const statusMap = {
        'interested': 'interest_received',
        'nda_pending': 'nda_signed',
        'nda_signed': 'nda_signed',
        'due_diligence': 'due_diligence',
        'negotiating': 'negotiating',
        'closed': 'closed'
      };
      
      if (statusMap[status]) {
        listing.dealStatus = statusMap[status];
        await listing.save();
      }
    }

    const updated = await Deal.findById(dealId)
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email')
      .populate('listingId', 'title askingPrice');

    res.json({
      message: 'Deal status updated',
      deal: updated
    });
  } catch (err) {
    console.error('Error updating deal status:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Submit negotiation offer
 * POST /api/deals/:dealId/negotiate
 */
exports.submitOffer = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { proposedPrice, message } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization (buyer or seller)
    const isBuyer = deal.buyerId.toString() === userId.toString();
    const isSeller = deal.sellerId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Validate proposed price
    if (proposedPrice && proposedPrice <= 0) {
      return res.status(400).json({ error: 'Invalid price' });
    }

    // Add to negotiation history
    const negotiationOffer = {
      fromUserId: userId,
      message: message || `Proposed price: ₹${proposedPrice}`,
      proposedPrice: proposedPrice || null,
      timestamp: new Date()
    };

    deal.negotiationHistory.push(negotiationOffer);

    // Update deal status to negotiating if not already
    if (deal.status !== 'negotiating') {
      deal.status = 'negotiating';
      deal.negotiationStartedAt = new Date();
    }

    await deal.save();

    const updated = await Deal.findById(dealId)
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email');

    res.json({
      message: 'Offer submitted',
      negotiation: negotiationOffer,
      deal: updated
    });
  } catch (err) {
    console.error('Error submitting offer:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Accept offer / Close deal
 * POST /api/deals/:dealId/accept-offer
 */
exports.acceptOffer = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { agreedPrice } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization (seller accepts)
    if (deal.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({
        error: 'Only seller can accept offer'
      });
    }

    // Update deal
    deal.agreedPrice = agreedPrice || deal.listingPrice;
    deal.status = 'closed';
    deal.closedAt = new Date();
    deal.sellerApproved = true;

    // Mark listing as sold
    const listing = await Marketplace.findById(deal.listingId);
    if (listing) {
      listing.status = 'sold';
      listing.dealStatus = 'closed';
      await listing.save();
    }

    await deal.save();

    const updated = await Deal.findById(dealId)
      .populate('buyerId', 'firstName lastName email')
      .populate('sellerId', 'firstName lastName email')
      .populate('listingId', 'title askingPrice');

    res.json({
      message: 'Offer accepted. Deal closed!',
      deal: updated,
      nextSteps: {
        message: 'Funds will be transferred via escrow',
        timeline: '5-7 business days'
      }
    });
  } catch (err) {
    console.error('Error accepting offer:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reject deal
 * POST /api/deals/:dealId/reject
 */
exports.rejectDeal = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    const isBuyer = deal.buyerId.toString() === userId.toString();
    const isSeller = deal.sellerId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update deal
    deal.status = 'cancelled';
    if (reason) {
      if (isBuyer) {
        deal.buyerNotes = reason;
      } else {
        deal.sellerNotes = reason;
      }
    }

    await deal.save();

    res.json({
      message: 'Deal cancelled',
      deal
    });
  } catch (err) {
    console.error('Error rejecting deal:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get negotiation history
 * GET /api/deals/:dealId/negotiations
 */
exports.getNegotiationHistory = async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId)
      .populate('negotiationHistory.fromUserId', 'firstName lastName email');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    if (deal.buyerId.toString() !== userId.toString() &&
        deal.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      dealId,
      negotiationHistory: deal.negotiationHistory.sort((a, b) => b.timestamp - a.timestamp)
    });
  } catch (err) {
    console.error('Error fetching negotiations:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Sign NDA
 * POST /api/deals/:dealId/sign-nda
 */
exports.signNDA = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { signature } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    const isBuyer = deal.buyerId.toString() === userId.toString();
    const isSeller = deal.sellerId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Sign NDA
    if (isBuyer) {
      deal.ndaSignedByBuyer = true;
    } else {
      deal.ndaSignedBySeller = true;
    }

    deal.ndaSignedAt = new Date();

    // Update status if both signed
    if (deal.ndaSignedByBuyer && deal.ndaSignedBySeller) {
      deal.status = 'nda_signed';
      
      // Update listing
      const listing = await Marketplace.findById(deal.listingId);
      if (listing) {
        listing.dealStatus = 'nda_signed';
        await listing.save();
      }
    }

    await deal.save();

    const updated = await Deal.findById(dealId)
      .populate('buyerId', 'firstName lastName')
      .populate('sellerId', 'firstName lastName');

    res.json({
      message: 'NDA signed successfully',
      deal: updated
    });
  } catch (err) {
    console.error('Error signing NDA:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Upload due diligence document
 * POST /api/deals/:dealId/upload-document
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { dealId } = req.params;
    const { name, type, url } = req.body;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId);
    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    const isBuyer = deal.buyerId.toString() === userId.toString();
    const isSeller = deal.sellerId.toString() === userId.toString();

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Add document
    const document = {
      name,
      url,
      type,
      uploadedAt: new Date(),
      uploadedBy: userId
    };

    deal.dueDiligenceDocuments.push(document);

    // Update deal status to due_diligence if needed
    if (deal.status === 'nda_signed') {
      deal.status = 'due_diligence';
      deal.dueDiligenceStartedAt = new Date();

      const listing = await Marketplace.findById(deal.listingId);
      if (listing) {
        listing.dealStatus = 'due_diligence';
        await listing.save();
      }
    }

    await deal.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get deal documents
 * GET /api/deals/:dealId/documents
 */
exports.getDocuments = async (req, res) => {
  try {
    const { dealId } = req.params;
    const userId = req.user._id;

    const deal = await Deal.findById(dealId)
      .populate('dueDiligenceDocuments.uploadedBy', 'firstName lastName');

    if (!deal) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    // Check authorization
    if (deal.buyerId.toString() !== userId.toString() &&
        deal.sellerId.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({
      dealId,
      documents: deal.dueDiligenceDocuments
    });
  } catch (err) {
    console.error('Error fetching documents:', err);
    res.status(500).json({ error: err.message });
  }
};
