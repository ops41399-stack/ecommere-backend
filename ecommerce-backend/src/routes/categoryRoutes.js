const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/authMiddleware');
const ctrl = require('../controllers/categoryController');

router.get('/', ctrl.listCategories);
router.post('/', protect, authorize('admin'), ctrl.createCategory);
router.put('/:id', protect, authorize('admin'), ctrl.updateCategory);
router.delete('/:id', protect, authorize('admin'), ctrl.deleteCategory);

module.exports = router;
