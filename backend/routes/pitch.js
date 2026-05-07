const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PitchDeck = require('../models/PitchDeck');

// Upload pitch deck
router.post('/upload', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can upload pitch decks' });
    }

    const { title, fileUrl } = req.body;

    const pitchDeck = new PitchDeck({
      founderId: req.user.userId,
      title,
      fileUrl,
      status: 'analyzed'
    });

    await pitchDeck.save();

    res.status(201).json({
      message: 'Pitch deck uploaded successfully',
      pitchDeck
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get pitch decks
router.get('/my-decks', auth, async (req, res) => {
  try {
    if (req.user.role !== 'founder') {
      return res.status(403).json({ message: 'Only founders can view their pitch decks' });
    }

    const decks = await PitchDeck.find({ founderId: req.user.userId });

    res.status(200).json({ decks });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get pitch deck analysis
router.get('/analysis/:id', auth, async (req, res) => {
  try {
    const pitchDeck = await PitchDeck.findById(req.params.id);

    if (!pitchDeck) {
      return res.status(404).json({ message: 'Pitch deck not found' });
    }

    res.status(200).json({ pitchDeck });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all pitch desks (for investors to browse)
router.get('/desks', auth, async (req, res) => {
  try {
    const { stage, industry } = req.query;
    
    const filter = { status: 'approved' };
    if (stage) filter.stage = stage;
    if (industry) filter.industry = industry;

    const pitchDesks = await PitchDeck.find(filter)
      .populate('founderId', 'firstName lastName email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      pitchDesks: pitchDesks.map(deck => ({
        _id: deck._id,
        founderName: deck.founderId?.firstName + ' ' + deck.founderId?.lastName || 'Unknown',
        company: deck.founderId?.company || 'Unnamed Company',
        stage: deck.stage || 'Unknown',
        industry: deck.industry || 'Other',
        description: deck.description || 'No description available',
        fundingAmount: deck.fundingAmount || 0,
        equityOffered: deck.equityOffered || 0,
        fileUrl: deck.fileUrl,
        createdAt: deck.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: err.message 
    });
  }
});

module.exports = router;
