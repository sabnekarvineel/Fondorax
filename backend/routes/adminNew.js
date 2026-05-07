const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminController = require('../controllers/adminController');

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

// ===== USER & ACCESS MANAGEMENT =====
router.get('/users', auth, requireAdmin, adminController.getAllUsers);
router.get('/users/:id', auth, requireAdmin, adminController.getUserDetails);
router.put('/users/:id/approve-founder', auth, requireAdmin, adminController.approveFounder);
router.put('/users/:id/reject-founder', auth, requireAdmin, adminController.rejectFounder);
router.put('/users/:id/approve-investor', auth, requireAdmin, adminController.approveInvestor);
router.put('/users/:id/suspend', auth, requireAdmin, adminController.suspendAccount);
router.put('/users/:id/unsuspend', auth, requireAdmin, adminController.unsuspendAccount);
router.put('/users/:id/reset-password', auth, requireAdmin, adminController.resetPassword);
router.put('/users/:id/kyc', auth, requireAdmin, adminController.updateKYCStatus);
router.put('/users/:id/flag', auth, requireAdmin, adminController.flagUser);

// ===== MARKETPLACE ADMINISTRATION =====
router.get('/marketplace/listings', auth, requireAdmin, adminController.getAllListings);
router.put('/marketplace/listings/:id/approve', auth, requireAdmin, adminController.approveListing);
router.put('/marketplace/listings/:id/reject', auth, requireAdmin, adminController.rejectListing);
router.put('/marketplace/listings/:id/freeze', auth, requireAdmin, adminController.freezeListing);
router.put('/marketplace/disputes/:id/resolve', auth, requireAdmin, adminController.handleDispute);

// ===== ANALYTICS DASHBOARD =====
router.get('/dashboard/stats', auth, requireAdmin, adminController.getDashboardStats);

// ===== AUDIT & LOGGING =====
router.get('/logs', auth, requireAdmin, adminController.getAdminLogs);

// ===== ADMIN MANAGEMENT =====
router.post('/assign-role/:userId', auth, requireAdmin, adminController.assignAdminRole);
router.get('/list', auth, requireAdmin, adminController.getAdminList);
router.delete('/remove-role/:userId', auth, requireAdmin, adminController.removeAdminRole);

module.exports = router;
