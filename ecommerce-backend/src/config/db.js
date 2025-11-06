// const mongoose = require('mongoose');

// /**
//  * Connect to MongoDB using an environment variable.
//  * Falls back to common alternative names and a sensible default when missing.
//  */
// const connectDB = async () => {
//   // Accept multiple common env var names so users using different setups won't hit undefined
//   const uri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/ecommerce';

//   if (typeof uri !== 'string' || uri.trim() === '') {
//     console.error('MongoDB connection error: MONGO_URI is not set or empty. Please set MONGO_URI in your .env or environment.');
//     process.exit(1);
//   }

//   try {
//     await mongoose.connect(uri);
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('MongoDB connection error:', err.message);
//     // keep original behavior (exit) so startup failures are visible
//     process.exit(1);
//   }
// };

// module.exports = connectDB;




const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/ecommerce';

  console.log('🧩 Using Mongo URI:', uri);

  if (typeof uri !== 'string' || uri.trim() === '') {
    console.error('❌ MongoDB connection error: MONGO_URI is not set or empty.');
    process.exit(1);
  }

  try {
    // Remove useNewUrlParser and useUnifiedTopology - they're deprecated
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
