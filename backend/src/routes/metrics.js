// ============================================================
// CloudPulse — Metrics Route
// ============================================================
// GET /api/metrics — Returns application-level metrics as JSON
//                    (consumed by the frontend dashboard).
// GET /metrics     — Returns Prometheus-format metrics
//                    (scraped by the Prometheus server).
// ============================================================

const express = require('express');
const router = express.Router();
const { register } = require('../middleware/requestCounter');
const { getCpuUsage, getMemoryUsage } = require('../utils/systemMetrics');

// ----- In-Memory Metrics History -----
// Stores time-series data for the frontend charts.
const HISTORY_SIZE = 60; // Keep 60 data points (5 minutes at 5s intervals)
const metricsHistory = [];

// Collect metrics snapshot every 5 seconds
setInterval(() => {
  const snapshot = {
    timestamp: new Date().toISOString(),
    cpu: getCpuUsage(),
    memory: getMemoryUsage().percentage,
    heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    activeHandles: process._getActiveHandles?.().length || 0,
    activeRequests: process._getActiveRequests?.().length || 0
  };

  metricsHistory.push(snapshot);

  // Keep only the most recent entries
  if (metricsHistory.length > HISTORY_SIZE) {
    metricsHistory.shift();
  }
}, 5000);

/**
 * GET /api/metrics
 * 
 * Returns application metrics as JSON for the frontend dashboard.
 * This is different from the Prometheus /metrics endpoint.
 * 
 * Response includes:
 * - Current CPU and memory usage
 * - Request statistics
 * - Time-series history for charts
 */
router.get('/', async (req, res) => {
  try {
    const currentCpu = getCpuUsage();
    const currentMemory = getMemoryUsage();

    // Get Prometheus metrics values for display
    const prometheusMetrics = await register.getMetricsAsJSON();
    
    // Find specific metric values
    const requestCountMetric = prometheusMetrics.find(
      m => m.name === 'cloudpulse_http_requests_total'
    );
    const requestDurationMetric = prometheusMetrics.find(
      m => m.name === 'cloudpulse_http_request_duration_seconds'
    );

    // Calculate total requests from counter
    let totalRequests = 0;
    if (requestCountMetric?.values) {
      totalRequests = requestCountMetric.values.reduce(
        (sum, v) => sum + v.value, 0
      );
    }

    // Calculate average response time from histogram
    let avgResponseTime = 0;
    if (requestDurationMetric?.values) {
      const sumEntry = requestDurationMetric.values.find(
        v => v.metricName?.includes('_sum')
      );
      const countEntry = requestDurationMetric.values.find(
        v => v.metricName?.includes('_count')
      );
      if (sumEntry && countEntry && countEntry.value > 0) {
        avgResponseTime = Math.round((sumEntry.value / countEntry.value) * 1000);
      }
    }

    res.json({
      timestamp: new Date().toISOString(),
      current: {
        cpu: currentCpu,
        memory: currentMemory,
        processMemory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        uptime: Math.floor(process.uptime())
      },
      requests: {
        total: totalRequests,
        avgResponseTime: `${avgResponseTime}ms`,
        requestsPerMinute: Math.round(totalRequests / (process.uptime() / 60)) || 0
      },
      history: metricsHistory
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

module.exports = router;
