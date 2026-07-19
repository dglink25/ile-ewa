const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', controller.getPublicSettings); // public : logo, couleurs, réseaux etc.
router.put('/', requireAuth, requireRole('admin'), controller.updateSettings);

module.exports = router;
