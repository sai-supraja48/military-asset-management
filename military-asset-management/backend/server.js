import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

// Error middleware
import {
  notFound,
  errorHandler
} from './middlewares/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();

/* =========================================================
   BASIC CONFIGURATION
========================================================= */

app.disable('x-powered-by');

/* =========================================================
   SECURITY
========================================================= */

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);

/* =========================================================
   CORS CONFIGURATION
========================================================= */

// Local development + deployed frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://military-asset-management-frontend-app.onrender.com'
];

// Add CLIENT_URL from Render Environment Variables
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .forEach((url) => {
      if (!allowedOrigins.includes(url)) {
        allowedOrigins.push(url);
      }
    });
}

console.log('======================================');
console.log('Allowed CORS Origins:');
console.log(allowedOrigins);
console.log('======================================');

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin:
      // Postman, Thunder Client, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      // Allow registered origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(`Blocked CORS origin: ${origin}`);

      // Do not crash the server for an invalid origin
      return callback(null, false);
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],

    optionsSuccessStatus: 204
  })
);

/* =========================================================
   BODY PARSING
========================================================= */

app.use(
  express.json({
    limit: '1mb'
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb'
  })
);

/* =========================================================
   REQUEST LOGGER
========================================================= */

app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.originalUrl}`
  );

  next();
});

/* =========================================================
   ROOT ROUTE
========================================================= */

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Military Asset Management API is running',
    api: '/api',
    health: '/api/health',
    environment: process.env.NODE_ENV || 'development'
  });
});

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Military Asset Management API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* =========================================================
   API ROUTES
========================================================= */

// Authentication
app.use('/api/auth', authRoutes);

// Lookup / common APIs
app.use('/api', lookupRoutes);

// Assets
app.use('/api/assets', assetRoutes);

// Purchases
app.use('/api/purchases', purchaseRoutes);

// Transfers
app.use('/api/transfers', transferRoutes);

// Assignments
app.use('/api/assignments', assignmentRoutes);

// Expenditures
app.use('/api/expenditures', expenditureRoutes);

// Audit Logs
app.use('/api/audit-logs', auditRoutes);

/* =========================================================
   404 HANDLER
========================================================= */

app.use(notFound);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(errorHandler);

/* =========================================================
   SERVER START
========================================================= */

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('======================================');
  console.log('   MILITARY ASSET MANAGEMENT API');
  console.log('======================================');
  console.log(`API running on port: ${PORT}`);
  console.log(
    `Environment: ${process.env.NODE_ENV || 'development'}`
  );
  console.log(
    `Health Check: http://localhost:${PORT}/api/health`
  );
  console.log('======================================');
  console.log('');
});

/* =========================================================
   SERVER ERROR HANDLING
========================================================= */

server.on('error', (error) => {
  console.error('Server Error:', error);

  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use.`);
    process.exit(1);
  }
});

/* =========================================================
   GRACEFUL SHUTDOWN
========================================================= */

const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down server...`);

  server.close(() => {
    console.log('Server closed successfully.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

/* =========================================================
   UNHANDLED ERRORS
========================================================= */

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});