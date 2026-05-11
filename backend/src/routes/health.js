// ============================================================
// CloudPulse — Health Route
// ============================================================
// GET /api/health — Lightweight health check endpoint.
// Used by Kubernetes liveness/readiness probes to determine
// if the pod is healthy and ready to receive traffic.
// ============================================================

const express = require('express');
const router = express.Router();

// Track application start time
const startTime = new Date();

/**
 * GET /api/health
 * 
 * Kubernetes uses this for:
 * - Liveness Probe: "Is this pod alive?" (restarts pod if not)
 * - Readiness Probe: "Can this pod handle traffic?" (removes from service if not)
 * 
 * Response example:
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "uptime": 3600,
 *   "version": "1.0.0"
 * }
 */
router.get('/', (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    version: process.env.npm_package_version || '1.0.0',
    startedAt: startTime.toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {
      server: 'up',
      memory: getMemoryHealth(),
      eventLoop: 'responsive'
    }
  };

  // If memory usage exceeds 90%, report as degraded
  if (healthData.checks.memory === 'critical') {
    return res.status(503).json({
      ...healthData,
      status: 'degraded'
    });
  }

  res.json(healthData);
});

/**
 * Check memory health status.
 * Returns 'healthy', 'warning', or 'critical' based on heap usage.
 */
function getMemoryHealth() {
  const mem = process.memoryUsage();
  const heapUsedPercent = (mem.heapUsed / mem.heapTotal) * 100;

  if (heapUsedPercent > 90) return 'critical';
  if (heapUsedPercent > 70) return 'warning';
  return 'healthy';
}

module.exports = router;
