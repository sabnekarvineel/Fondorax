const express = require('express');
const router = express.Router();
const Resource = require('../models/Resource');
const EligibilityProfile = require('../models/EligibilityProfile');

// ===========================
// GET ALL RESOURCES WITH FILTERS
// ===========================
router.get('/', async (req, res) => {
  try {
    const { type, stage, sector, location, search, sort, page = 1, limit = 12, featured } = req.query;

    let filter = { isActive: true };

    // Type filter
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Stage filter
    if (stage && stage !== 'all') {
      filter.stage = { $in: [stage] };
    }

    // Sector filter
    if (sector && sector !== 'all') {
      filter.sector = { $in: [sector] };
    }

    // Location filter
    if (location && location !== 'all') {
      filter.location = { $in: [location] };
    }

    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
      filter.featuredUntil = { $gt: new Date() };
    }

    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    let sortObj = {};
    if (sort === 'deadline') {
      sortObj = { deadline: 1 };
    } else if (sort === 'recent') {
      sortObj = { createdAt: -1 };
    } else if (sort === 'featured') {
      sortObj = { isFeatured: -1, createdAt: -1 };
    } else {
      sortObj = { isFeatured: -1, deadline: 1 };
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count
    const total = await Resource.countDocuments(filter);

    // Get resources
    const resources = await Resource.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      resources,
    });
  } catch (error) {
    console.error('Error fetching resources:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// GET SINGLE RESOURCE
// ===========================
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, resource });
  } catch (error) {
    console.error('Error fetching resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// CREATE RESOURCE (ADMIN ONLY)
// ===========================
router.post('/', async (req, res) => {
  try {
    const { title, type, organization, description, fundingAmount, stage, sector, eligibility, requirements, location, deadline, link, applicationUrl, contactEmail } = req.body;

    // Validation
    if (!title || !type || !organization || !description || !eligibility || !link) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const resource = new Resource({
      title,
      type,
      organization,
      description,
      fundingAmount,
      stage: Array.isArray(stage) ? stage : [stage],
      sector: Array.isArray(sector) ? sector : [sector],
      eligibility,
      requirements: Array.isArray(requirements) ? requirements : [requirements],
      location: Array.isArray(location) ? location : [location],
      deadline: deadline ? new Date(deadline) : null,
      link,
      applicationUrl,
      contactEmail,
      createdBy: req.user?.id || 'admin',
    });

    await resource.save();
    res.status(201).json({ success: true, message: 'Resource created', resource });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// UPDATE RESOURCE (ADMIN ONLY)
// ===========================
router.put('/:id', async (req, res) => {
  try {
    const { title, type, organization, description, fundingAmount, stage, sector, eligibility, requirements, location, deadline, link, applicationUrl, contactEmail, isFeatured, featuredUntil, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (type) updateData.type = type;
    if (organization) updateData.organization = organization;
    if (description) updateData.description = description;
    if (fundingAmount) updateData.fundingAmount = fundingAmount;
    if (stage) updateData.stage = Array.isArray(stage) ? stage : [stage];
    if (sector) updateData.sector = Array.isArray(sector) ? sector : [sector];
    if (eligibility) updateData.eligibility = eligibility;
    if (requirements) updateData.requirements = Array.isArray(requirements) ? requirements : [requirements];
    if (location) updateData.location = Array.isArray(location) ? location : [location];
    if (deadline) updateData.deadline = new Date(deadline);
    if (link) updateData.link = link;
    if (applicationUrl) updateData.applicationUrl = applicationUrl;
    if (contactEmail) updateData.contactEmail = contactEmail;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (featuredUntil) updateData.featuredUntil = new Date(featuredUntil);
    if (isActive !== undefined) updateData.isActive = isActive;

    const resource = await Resource.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, message: 'Resource updated', resource });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// DELETE RESOURCE (ADMIN ONLY)
// ===========================
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByIdAndDelete(req.params.id);

    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    res.status(200).json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// ELIGIBILITY CHECKER
// ===========================
router.post('/eligibility/check', async (req, res) => {
  try {
    const userId = req.user?.id || req.body.userId;
    const profileData = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required' });
    }

    // Save or update eligibility profile
    let profile = await EligibilityProfile.findOneAndUpdate(
      { userId },
      {
        ...profileData,
        userId,
        completedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Calculate eligibility score and matching resources
    const eligibilityScore = calculateEligibilityScore(profile);
    profile.eligibilityScore = eligibilityScore;
    await profile.save();

    // Find matching resources
    const matchingResources = await findMatchingResources(profile);

    res.status(200).json({
      success: true,
      profile,
      eligibilityScore,
      matchingResources,
    });
  } catch (error) {
    console.error('Error in eligibility check:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// GET USER ELIGIBILITY PROFILE
// ===========================
router.get('/eligibility/profile/:userId', async (req, res) => {
  try {
    const profile = await EligibilityProfile.findOne({ userId: req.params.userId });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const matchingResources = await findMatchingResources(profile);

    res.status(200).json({
      success: true,
      profile,
      matchingResources,
    });
  } catch (error) {
    console.error('Error fetching eligibility profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ===========================
// HELPER FUNCTIONS
// ===========================

function calculateEligibilityScore(profile) {
  let score = 0;

  // Registered startup (20 points)
  if (profile.isRegistered) {
    score += 20;
    if (profile.registrationType === 'DPIIT') score += 10;
  }

  // Stage and Revenue (15 points)
  if (profile.hasRevenue) {
    score += 10;
    if (profile.monthlyRevenue > 100000) score += 5;
  }

  // Team size (10 points)
  if (profile.teamSize >= 3) score += 10;
  else if (profile.teamSize >= 2) score += 5;

  // Founder profile (15 points)
  if (profile.isFemaleFounder) score += 10;
  if (profile.isFirstTimeFounder) score += 0; // No bonus, but not penalty
  if (profile.founderExperience > 5) score += 10;
  if (profile.previousStartups > 0) score += 5;

  // SC/ST Startup (15 points)
  if (profile.isSCSTStartup) score += 15;

  // IP (10 points)
  if (profile.hasPatent) score += 10;
  if (profile.hasTradeSecret) score += 5;

  // Compliance (5 points)
  if (profile.hasGSTRegistration) score += 3;
  if (profile.hasTaxRegistration) score += 2;

  return Math.min(score, 100);
}

async function findMatchingResources(profile) {
  const filters = { isActive: true };
  const matchedResources = [];

  // Get all resources and score them
  const allResources = await Resource.find(filters);

  for (const resource of allResources) {
    let matchScore = 0;
    const reasons = [];

    // Stage matching
    if (resource.stage.includes(profile.stage)) {
      matchScore += 20;
      reasons.push(`Matches your stage: ${profile.stage}`);
    }

    // Sector matching
    if (profile.sector && resource.sector.includes(profile.sector)) {
      matchScore += 20;
      reasons.push(`Matches your sector: ${profile.sector}`);
    }

    // Location matching
    if (resource.location.includes(profile.headquarterState) || resource.location.includes('India')) {
      matchScore += 15;
      reasons.push(`Available in your state: ${profile.headquarterState}`);
    }

    // Registration requirements
    if (resource.eligibility.includes('registered') || resource.eligibility.includes('registration')) {
      if (profile.isRegistered) {
        matchScore += 15;
        reasons.push('You meet registration requirements');
      }
    }

    // SC/ST schemes
    if (resource.title.toLowerCase().includes('sc') || resource.title.toLowerCase().includes('st')) {
      if (profile.isSCSTStartup) {
        matchScore += 25;
        reasons.push('SC/ST specific scheme');
      }
    }

    // Women founders
    if (resource.title.toLowerCase().includes('women') || resource.eligibility.toLowerCase().includes('women')) {
      if (profile.isFemaleFounder) {
        matchScore += 25;
        reasons.push('Women founder specific scheme');
      }
    }

    // Startup stage matching
    if (profile.hasRevenue && resource.type === 'government') {
      matchScore += 10;
      reasons.push('Government scheme supports profitable startups');
    }

    // Only include resources with at least 20% match
    if (matchScore >= 20) {
      matchedResources.push({
        ...resource.toObject(),
        matchScore,
        matchReasons: reasons,
        eligible: matchScore >= 50,
      });
    }
  }

  // Sort by match score
  matchedResources.sort((a, b) => b.matchScore - a.matchScore);

  return matchedResources;
}

module.exports = router;
