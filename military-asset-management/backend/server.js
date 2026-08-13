import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import lookupRoutes from './routes/lookupRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import auditRoutes from './routes/auditRoutes.js';

import {
  notFound,
  errorHandler
} from './middlewares/errorMiddleware.js';

dotenv.config();

const app = express();

/* ================================
   SECURITY
================================ */

app.use(helmet());

/* ================================
   CORS
================================ */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://military-asset-management-frontend-app.onrender.com'
];

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

console.log('Allowed CORS origins:', allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow Postman / server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log('Blocked CORS origin:', origin);

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
    ]
  })
);

/* ================================
   BODY PARSING
================================ */

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

/* ================================
   HEALTH CHECK
================================ */

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Military Asset Management API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* ================================
   API ROUTES
================================ */

app.use('/api/auth', authRoutes);

app.use('/api', lookupRoutes);

app.use('/api/assets', assetRoutes);

app.use('/api/purchases', purchaseRoutes);

app.use('/api/transfers', transferRoutes);

app.use('/api/assignments', assignmentRoutes);

app.use('/api/expenditures', expenditureRoutes);

app.use('/api/audit-logs', auditRoutes);

/* ================================
   404
================================ */

app.use(notFound);

/* ================================
   ERROR HANDLER
================================ */

app.use(errorHandler);

/* ================================
   SERVER
================================ */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('======================================');
  console.log('Military Asset Management API');
  console.log(`API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('======================================');
});