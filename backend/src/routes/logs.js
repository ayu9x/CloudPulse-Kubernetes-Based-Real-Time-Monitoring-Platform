// ============================================================
// CloudPulse — Logs Route
// ============================================================
// GET /api/logs — Returns recent application logs from the
//                 in-memory ring buffer maintained by the logger.
// ============================================================

const express = require('express');
const router = express.Router();
const { getLogs, clearLogs } = require('../middleware/logger');

/**
 * GET /api/logs
 * 
 * Returns recent application logs for the dashboard.
 * Supports query parameters for filtering:
 *   ?level=error    — Filter by log level
 *   ?limit=20       — Limit number of logs returned
 * 
 * Response example:
 * {
 *   "count": 50,
 *   "logs": [
 *     { "timestamp": "...", "level": "info", "message": "Request completed", "meta": {...} }
 *   ]
 * }
 */
router.get('/', (req, res) => {
  try {
    let logs = getLogs();

    // Filter by level if specified
    const { level, limit } = req.query;
    if (level) {
      logs = logs.filter(log => log.level === level);
    }

    // Apply limit
    const maxLogs = parseInt(limit) || 50;
    logs = logs.slice(0, maxLogs);

    res.json({
      count: logs.length,
      total: getLogs().length,
      filters: {
        level: level || 'all',
        limit: maxLogs
      },
      logs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve logs',
      message: error.message
    });
  }
});

/**
 * DELETE /api/logs
 * 
 * Clears all logs from the ring buffer.
 * Useful for testing or dashboard reset.
 */
router.delete('/', (req, res) => {
  clearLogs();
  res.json({
    message: 'Logs cleared successfully',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
