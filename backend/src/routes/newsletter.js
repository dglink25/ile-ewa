const express = require('express');
const router = express.Router();
const controller = require('../controllers/newsletterController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.post('/subscribe', controller.subscribe);
router.post('/unsubscribe', controller.unsubscribe);
router.get('/', requireAuth, requireRole('admin'), controller.listAll);

module.exports = router;
