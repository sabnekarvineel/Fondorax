const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  expressInterest,
  getMyInterests,
  getInterestsReceived,
  getDealDetails,
  updateDealStatus,
  submitOffer,
  acceptOffer,
  rejectDeal,
  getNegotiationHistory,
  signNDA,
  uploadDocument,
  getDocuments
} = require('../controllers/dealController');

/**
 * Deal Routes
 * All routes require authentication
 */

// Express interest in a listing
router.post('/express-interest/:listingId', auth, expressInterest);

// Buyer dashboard - my interests
router.get('/my-interests', auth, getMyInterests);

// Seller dashboard - interests received
router.get('/interests-received/:listingId', auth, getInterestsReceived);

// Deal details
router.get('/:dealId', auth, getDealDetails);

// Update deal status
router.put('/:dealId/status', auth, updateDealStatus);

// Deal negotiation
router.post('/:dealId/negotiate', auth, submitOffer);
router.get('/:dealId/negotiations', auth, getNegotiationHistory);

// Offer acceptance/rejection
router.post('/:dealId/accept-offer', auth, acceptOffer);
router.post('/:dealId/reject', auth, rejectDeal);

// NDA signing
router.post('/:dealId/sign-nda', auth, signNDA);

// Due diligence documents
router.post('/:dealId/upload-document', auth, uploadDocument);
router.get('/:dealId/documents', auth, getDocuments);

module.exports = router;
