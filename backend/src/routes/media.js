const express = require('express');
const router = express.Router();
const controller = require('../controllers/mediaController');
const { requireAuth, requireRole } = require('../middleware/auth');
const upload = require('../config/multer');

router.post('/', requireAuth, requireRole('admin', 'member'), upload.single('file'), controller.upload);
router.get('/', requireAuth, requireRole('admin'), controller.list);
router.delete('/:id', requireAuth, requireRole('admin'), controller.remove);

module.exports = router;
