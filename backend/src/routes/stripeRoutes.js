const express = require('express');
const router = express.Router();
const stripeController = require('../controllers/stripeController');
const { authenticate } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/authMiddleware');

/**
 * Public/Authenticated routes
 */

// Create checkout session (requires authentication)
router.post('/create-checkout-session', authenticate, stripeController.createCheckoutSession);

// Get subscription details (user can view their own, admins can view any)
router.get('/subscription/:userId', authenticate, stripeController.getSubscriptionDetails);

// Create billing portal session (for users to manage their own subscription)
router.post('/create-portal-session', authenticate, stripeController.createPortalSession);

/**
 * Admin-only routes
 */

// Cancel subscription (admin only)
router.post('/cancel-subscription', authenticate, requirePermission('manage_users'), stripeController.cancelSubscription);

// Process refund (admin only)
router.post('/refund', authenticate, requirePermission('manage_users'), stripeController.processRefund);

/**
 * Webhook route (no authentication - Stripe signature verification instead)
 * IMPORTANT: This route must use raw body, not JSON parsed body
 */
router.post('/webhook', express.raw({ type: 'application/json' }), stripeController.handleWebhook);

module.exports = router;
