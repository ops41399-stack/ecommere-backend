const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/reportController');

router.get('/sales', protect, authorize('admin'), ctrl.salesReport);

module.exports = router;
