const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createListing,
  getListings,
  getSingleListing,
  updateListing,
  deleteListing,
  saveListing,
  getSavedListings,
  getValuation,
  calculateValuation,
  getFilterOptions
} = require('../controllers/marketplaceController');

/**
 * Marketplace Routes
 * All routes require authentication
 */

// PUBLIC ROUTES (no auth needed for some)
router.get('/filters/options', getFilterOptions);

// PROTECTED ROUTES (auth required)

// Listing CRUD
router.post('/listings', auth, createListing);
router.get('/listings', auth, getListings);
router.get('/listings/:id', auth, getSingleListing);
router.put('/listings/:id', auth, updateListing);
router.delete('/listings/:id', auth, deleteListing);

// Save/Wishlist
router.post('/listings/:id/save', auth, saveListing);
router.get('/saved', auth, getSavedListings);

// Valuation
router.get('/listings/:id/valuation', auth, getValuation);
router.post('/valuations/calculate', auth, calculateValuation);

module.exports = router;
