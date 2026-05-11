// ============================================================
// CloudPulse — Prometheus Request Counter Middleware
// ============================================================
// Tracks HTTP request metrics using the prom-client library.
// These metrics are scraped by Prometheus at /metrics endpoint.
// ============================================================

const client = require('prom-client');

// ----- Create a Registry -----
// The registry collects all metrics and exposes them at /metrics.
const register = new client.Registry();

// Add default Node.js metrics (event loop lag, heap size, GC, etc.)
client.collectDefaultMetrics({ register });

// ----- Custom Metrics -----

/**
 * Counter: Total number of HTTP requests.
 * Labels: method (GET/POST), route (/api/status), status_code (200/404/500)
 * 
 * A Counter is a cumulative metric that ONLY goes up.
 * It's perfect for counting requests, errors, tasks completed.
 */
const httpRequestsTotal = new client.Counter({
  name: 'cloudpulse_http_requests_total',
  help: 'Total number of HTTP requests received',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

/**
 * Histogram: HTTP request duration in seconds.
 * Tracks how long each request takes to process.
 * 
 * A Histogram samples observations and counts them in buckets.
 * It's perfect for measuring request latencies.
 */
const httpRequestDuration = new client.Histogram({
  name: 'cloudpulse_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5],
  registers: [register]
});

/**
 * Gauge: Number of currently active requests.
 * 
 * A Gauge is a metric that can go UP or DOWN.
 * It's perfect for measuring in-progress requests, temperature, queue size.
 */
const activeRequests = new client.Gauge({
  name: 'cloudpulse_active_requests',
  help: 'Number of currently active requests',
  registers: [register]
});

/**
 * Counter: Total number of errors.
 */
const errorsTotal = new client.Counter({
  name: 'cloudpulse_errors_total',
  help: 'Total number of error responses (4xx and 5xx)',
  labelNames: ['status_code'],
  registers: [register]
});

/**
 * Gauge: Application uptime in seconds.
 */
const uptimeGauge = new client.Gauge({
  name: 'cloudpulse_uptime_seconds',
  help: 'Application uptime in seconds',
  registers: [register]
});

// Update uptime every 5 seconds
setInterval(() => {
  uptimeGauge.set(Math.floor(process.uptime()));
}, 5000);

// ----- Middleware Function -----

/**
 * Express middleware that records metrics for every request.
 */
function metricsMiddleware(req, res, next) {
  // Skip metrics endpoint itself to avoid recursion
  if (req.path === '/metrics') {
    return next();
  }

  // Track active requests
  activeRequests.inc();
  const end = httpRequestDuration.startTimer();

  // When response finishes, record the metrics
  res.on('finish', () => {
    const route = req.route?.path || req.path;
    const labels = {
      method: req.method,
      route: route,
      status_code: res.statusCode
    };

    // Increment request counter
    httpRequestsTotal.inc(labels);

    // Record request duration
    end(labels);

    // Decrement active requests
    activeRequests.dec();

    // Track errors
    if (res.statusCode >= 400) {
      errorsTotal.inc({ status_code: res.statusCode });
    }
  });

  next();
}

module.exports = {
  register,
  metricsMiddleware,
  httpRequestsTotal,
  httpRequestDuration,
  activeRequests
};
