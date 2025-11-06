const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/orderController');

router.post('/', protect, ctrl.placeOrder);
router.get('/', protect, ctrl.listOrders);
router.get('/:id', protect, ctrl.getOrder);
router.put('/:id/status', protect, authorize('admin'), ctrl.updateStatus);

module.exports = router;
