// ============================================================
// CloudPulse — Status Route
// ============================================================
// GET /api/status — Returns comprehensive server status including
// hostname, platform, CPU, memory, uptime, and pod information.
// ============================================================

const express = require('express');
const router = express.Router();
const { getSystemSnapshot, getPodInfo } = require('../utils/systemMetrics');

/**
 * GET /api/status
 * 
 * Returns the current server status with system metrics.
 * The frontend dashboard polls this endpoint every 5 seconds.
 * 
 * Response example:
 * {
 *   "status": "operational",
 *   "timestamp": "2024-01-15T10:30:00.000Z",
 *   "server": { hostname, platform, cpu, memory, uptime },
 *   "pods": [ { name, status, restarts, age, cpu, memory } ]
 * }
 */
router.get('/', (req, res) => {
  try {
    const snapshot = getSystemSnapshot();
    const pods = getPodInfo();

    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      server: snapshot,
      pods: pods,
      cluster: {
        name: 'cloudpulse-cluster',
        provider: 'k3s',
        region: 'us-east-1',
        nodeCount: 1,
        podCount: pods.length,
        namespacesActive: ['cloudpulse', 'kube-system', 'monitoring']
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve system status',
      error: error.message
    });
  }
});

module.exports = router;
