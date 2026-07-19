const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactController');

router.post('/', controller.submit);

module.exports = router;
