const express = require('express');
const router = express.Router();
const controller = require('../controllers/profilesController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public
router.get('/public', controller.listPublic);
router.get('/public/:slug', controller.getPublicBySlug);

// Membre connecté
router.get('/me', requireAuth, controller.getMyProfile);
router.put('/me', requireAuth, controller.updateMyProfile);

// Admin
router.get('/', requireAuth, requireRole('admin'), controller.listAll);
router.put('/:id/publish', requireAuth, requireRole('admin'), controller.setPublished);
router.put('/:id', requireAuth, requireRole('admin'), controller.adminUpdate);

module.exports = router;
