const express = require('express');
const router = express.Router();
const controller = require('../controllers/articlesController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../config/multer');

// ── Public ──────────────────────────────
router.get('/public', controller.listPublic);
router.get('/public/:slug', controller.getPublicBySlug);

// ── Admin ────────────────────────────────
router.get('/', requireAuth, requireRole('admin'), controller.listAll);
router.get('/:id', requireAuth, requireRole('admin'), controller.getById);
router.post('/', requireAuth, requireRole('admin'), controller.create);
router.put('/:id', requireAuth, requireRole('admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

// Upload supports de formation (plusieurs fichiers)
router.post(
  '/upload-supports',
  requireAuth, requireRole('admin'),
  upload.array('files', 20), // max 20 fichiers à la fois
  controller.uploadSupport,
);

module.exports = router;
