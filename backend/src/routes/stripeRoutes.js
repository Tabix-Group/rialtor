const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authenticateToken } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

/**
 * Public/Authenticated routes
 */

// Create checkout session (requires authentication + Stripe configured)
router.post('/create-checkout-session', authenticateToken, stripeController.requireStripe, stripeController.createCheckoutSession);

// Get subscription details (user can view their own, admins can view any)
router.get('/subscription/:userId', authenticateToken, stripeController.requireStripe, stripeController.getSubscriptionDetails);

// Create billing portal session (for users to manage their own subscription)
router.post('/create-portal-session', authenticateToken, stripeController.requireStripe, stripeController.createPortalSession);

/**
 * Admin-only routes
 */

// Cancel subscription (admin only)
router.post('/cancel-subscription', authenticateToken, checkPermission('manage_users'), stripeController.requireStripe, stripeController.cancelSubscription);

// Process refund (admin only)
router.post('/refund', authenticateToken, checkPermission('manage_users'), stripeController.requireStripe, stripeController.processRefund);

/**
 * Webhook route (no authentication - Stripe signature verification instead)
 * IMPORTANT: This route must use raw body, not JSON parsed body
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.requireStripe, stripeController.handleWebhook);

module.exports = router;
