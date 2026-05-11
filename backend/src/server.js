// ============================================================
// CloudPulse — Main Server Entry Point
// ============================================================
// Express.js server that provides REST APIs, Prometheus metrics,
// structured logging, and health checks for the monitoring platform.
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { logger, requestLogger } = require('./middleware/logger');
const { register, metricsMiddleware } = require('./middleware/requestCounter');

// ----- Initialize Express App -----
const app = express();
const PORT = process.env.PORT || 8080;

// ----- Middleware Stack -----

// CORS — Allows the frontend to make requests to the backend.
// In Kubernetes, frontend and backend are on different services.
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

// Parse JSON request bodies
app.use(express.json());

// Prometheus metrics collection (must be before routes)
app.use(metricsMiddleware);

// Request logging (logs every request to console + ring buffer)
app.use(requestLogger);

// ----- Prometheus Metrics Endpoint -----
// This is the endpoint that Prometheus scrapes every 15 seconds.
// It returns metrics in the Prometheus exposition format.
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// ----- API Routes -----
app.use('/api/status', require('./routes/status'));
app.use('/api/health', require('./routes/health'));
app.use('/api/metrics', require('./routes/metrics'));
app.use('/api/logs', require('./routes/logs'));

// ----- Root Endpoint -----
app.get('/', (req, res) => {
  res.json({
    name: 'CloudPulse API',
    version: '1.0.0',
    description: 'Kubernetes-Based Real-Time Monitoring Platform',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      metrics: '/api/metrics',
      logs: '/api/logs',
      prometheus: '/metrics'
    },
    documentation: 'https://github.com/your-username/CloudPulse'
  });
});

// ----- 404 Handler -----
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} does not exist`,
    availableEndpoints: ['/api/health', '/api/status', '/api/metrics', '/api/logs', '/metrics']
  });
});

// ----- Error Handler -----
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message
  });
});

// ----- Start Server -----
app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 CloudPulse Backend running on port ${PORT}`);
  logger.info(`📊 Prometheus metrics available at /metrics`);
  logger.info(`🏥 Health check available at /api/health`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// ----- Graceful Shutdown -----
// Handles SIGTERM (sent by Kubernetes during pod termination)
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down...');
  process.exit(0);
});

module.exports = app;
