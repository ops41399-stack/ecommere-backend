require('dotenv').config();

const express = require('express');
const http = require('http');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const errorHandler = require('./middlewares/errorMiddleware');
const { initSocket } = require('./utils/socket');
const { startJobs } = require('./jobs/cronJobs');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Debug: Check if .env loaded properly
console.log("✅ Environment Check:");
console.log("   PORT:", process.env.PORT || "Not set");
console.log("   MONGO_URI:", process.env.MONGO_URI || "⚠️ NOT LOADED");
console.log("   BASE_URL:", process.env.BASE_URL || "Not set");

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize socket
const io = initSocket(server);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Ecommerce API',
      version: '1.0.0',
      description: 'Backend APIs'
    },
    servers: [{ url: process.env.BASE_URL || 'http://localhost:5000' }]
  },
  apis: ['./src/routes/*.js']
};
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/', (req, res) => res.send('Ecommerce backend running'));

// Error handler
app.use(errorHandler);

// Start cron jobs
startJobs();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 ======================================`);
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`✅ MongoDB URI loaded: ${process.env.MONGO_URI ? 'Yes ✓' : 'No ✗'}`);
  console.log(`📝 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`========================================\n`);
});