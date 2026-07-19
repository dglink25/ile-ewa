const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagesController');
const { requireAuth, requireRole } = require('../middleware/auth');

// Public
router.get('/public/:slug', controller.getPublicBySlug);

// Admin
router.get('/', requireAuth, requireRole('admin'), controller.listAll);
router.get('/:id', requireAuth, requireRole('admin'), controller.getById);
router.post('/', requireAuth, requireRole('admin'), controller.create);
router.put('/:id', requireAuth, requireRole('admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

module.exports = router;
