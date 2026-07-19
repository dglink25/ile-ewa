const express = require('express');
const router = express.Router();
const controller = require('../controllers/statsController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/', requireAuth, requireRole('admin'), controller.getStats);

module.exports = router;
