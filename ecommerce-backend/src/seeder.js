require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');

const run = async () => {
  await connectDB();
  try {
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();

    const admin = await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD, role: 'admin' });
    const cat1 = await Category.create({ name: 'Electronics' });
    const cat2 = await Category.create({ name: 'Fashion' });

    await Product.create([
      { name: 'Smartphone', price: 15000, stock: 50, categoryId: cat1._id, sku: 'SP-001' },
      { name: 'T-Shirt', price: 500, stock: 100, categoryId: cat2._id, sku: 'TS-001' }
    ]);

    console.log('Seeding done');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
