const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/productController');

router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProductWithCategory);

// admin routes
router.post('/', protect, authorize('admin'), ctrl.createProduct);
router.put('/:id', protect, authorize('admin'), ctrl.updateProduct);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteProduct);

module.exports = router;
