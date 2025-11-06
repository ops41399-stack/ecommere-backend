const Category = require('../models/Category');

exports.createCategory = async (req, res, next) => {
  try {
    const c = await Category.create(req.body);
    res.status(201).json(c);
  } catch (err) { next(err); }
};

exports.listCategories = async (req, res, next) => {
  try {
    const cats = await Category.find().sort({ name: 1 });
    res.json(cats);
  } catch (err) { next(err); }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(c);
  } catch (err) { next(err); }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
