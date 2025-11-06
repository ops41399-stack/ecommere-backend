const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/couponController');

router.post('/', protect, authorize('admin'), ctrl.createCoupon);
router.post('/validate', protect, ctrl.validateCoupon);

module.exports = router;
