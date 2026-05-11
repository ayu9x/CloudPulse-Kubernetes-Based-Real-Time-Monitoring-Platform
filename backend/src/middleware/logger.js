// ============================================================
// CloudPulse — Winston Logger Middleware
// ============================================================
// Provides structured logging with Winston and maintains an
// in-memory ring buffer of recent logs for the /api/logs endpoint.
// ============================================================

const winston = require('winston');
const Transport = require('winston-transport');

// ----- In-Memory Log Storage (Ring Buffer) -----
// Stores the most recent logs for the dashboard.
// In production, you'd use ELK Stack, Loki, or CloudWatch.
const MAX_LOGS = 100;
const logBuffer = [];

/**
 * Custom Winston transport that pushes logs into the ring buffer.
 * Extends winston-transport (base class) instead of Stream transport.
 */
class BufferTransport extends Transport {
  constructor(opts) {
    super(opts);
  }

  log(info, callback) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: info.level,
      message: info.message,
      ...(info.meta && { meta: info.meta })
    };

    logBuffer.push(logEntry);

    // Keep only the most recent MAX_LOGS entries (ring buffer)
    if (logBuffer.length > MAX_LOGS) {
      logBuffer.shift();
    }

    callback();
  }
}

// ----- Create Winston Logger -----
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'cloudpulse-backend' },
  transports: [
    // Console output (visible in kubectl logs)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1
            ? ` ${JSON.stringify(meta)}`
            : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      )
    }),
    // In-memory buffer for dashboard
    new BufferTransport()
  ]
});

/**
 * Express middleware that logs every incoming request.
 */
function requestLogger(req, res, next) {
  const start = Date.now();

  // Log when the response finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    };

    // Choose log level based on status code
    if (res.statusCode >= 500) {
      logger.error('Request failed', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('Client error', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
}

/**
 * Get all logs from the ring buffer.
 */
function getLogs() {
  return [...logBuffer].reverse(); // Most recent first
}

/**
 * Clear the log buffer.
 */
function clearLogs() {
  logBuffer.length = 0;
}

module.exports = {
  logger,
  requestLogger,
  getLogs,
  clearLogs
};
