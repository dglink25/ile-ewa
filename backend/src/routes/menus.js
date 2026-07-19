const express = require('express');
const router = express.Router();
const controller = require('../controllers/menusController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.get('/public', controller.listPublic);
router.get('/', requireAuth, requireRole('admin'), controller.listAll);
router.post('/', requireAuth, requireRole('admin'), controller.create);
router.put('/:id', requireAuth, requireRole('admin'), controller.update);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

module.exports = router;
