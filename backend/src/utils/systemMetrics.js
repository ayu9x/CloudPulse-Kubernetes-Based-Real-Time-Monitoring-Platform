// ============================================================
// CloudPulse — System Metrics Utility
// ============================================================
// Collects OS-level metrics (CPU, memory, uptime) and simulates
// pod-level information for the dashboard display.
// ============================================================

const os = require('os');

/**
 * Get CPU usage percentage.
 * Calculates the ratio of idle time to total time across all cores.
 */
function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idlePercentage = (totalIdle / totalTick) * 100;
  const usagePercentage = 100 - idlePercentage;

  return Math.round(usagePercentage * 100) / 100;
}

/**
 * Get memory usage statistics in MB and percentage.
 */
function getMemoryUsage() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;

  return {
    total: Math.round(totalMem / 1024 / 1024),       // MB
    used: Math.round(usedMem / 1024 / 1024),          // MB
    free: Math.round(freeMem / 1024 / 1024),          // MB
    percentage: Math.round((usedMem / totalMem) * 100 * 100) / 100
  };
}

/**
 * Get process-level memory usage (Node.js heap).
 */
function getProcessMemory() {
  const mem = process.memoryUsage();
  return {
    rss: Math.round(mem.rss / 1024 / 1024),           // Resident Set Size (MB)
    heapTotal: Math.round(mem.heapTotal / 1024 / 1024),
    heapUsed: Math.round(mem.heapUsed / 1024 / 1024),
    external: Math.round(mem.external / 1024 / 1024)
  };
}

/**
 * Simulate pod information.
 * In a real K8s environment, this would come from the Kubernetes API.
 * For this project, we simulate realistic pod data.
 */
function getPodInfo() {
  const hostname = os.hostname();
  const uptime = process.uptime();

  return [
    {
      name: `cloudpulse-backend-${hostname.slice(-5) || 'abc12'}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime),
      cpu: `${Math.floor(Math.random() * 30 + 10)}m`,
      memory: `${Math.floor(Math.random() * 50 + 30)}Mi`,
      node: hostname
    },
    {
      name: `cloudpulse-backend-${generateId()}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime + 120),
      cpu: `${Math.floor(Math.random() * 30 + 10)}m`,
      memory: `${Math.floor(Math.random() * 50 + 30)}Mi`,
      node: hostname
    },
    {
      name: `cloudpulse-frontend-${generateId()}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime + 60),
      cpu: `${Math.floor(Math.random() * 15 + 5)}m`,
      memory: `${Math.floor(Math.random() * 30 + 15)}Mi`,
      node: hostname
    },
    {
      name: `cloudpulse-frontend-${generateId()}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime + 180),
      cpu: `${Math.floor(Math.random() * 15 + 5)}m`,
      memory: `${Math.floor(Math.random() * 30 + 15)}Mi`,
      node: hostname
    },
    {
      name: `prometheus-server-${generateId()}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime + 300),
      cpu: `${Math.floor(Math.random() * 50 + 20)}m`,
      memory: `${Math.floor(Math.random() * 100 + 80)}Mi`,
      node: hostname
    },
    {
      name: `grafana-${generateId()}`,
      namespace: 'cloudpulse',
      status: 'Running',
      restarts: 0,
      age: formatUptime(uptime + 240),
      cpu: `${Math.floor(Math.random() * 40 + 15)}m`,
      memory: `${Math.floor(Math.random() * 80 + 50)}Mi`,
      node: hostname
    }
  ];
}

/**
 * Format seconds into human-readable uptime (e.g., "2d 5h 30m").
 */
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Generate a short random ID (simulates K8s pod hash).
 */
function generateId() {
  return Math.random().toString(36).substring(2, 7);
}

/**
 * Get comprehensive system metrics snapshot.
 */
function getSystemSnapshot() {
  return {
    hostname: os.hostname(),
    platform: os.platform(),
    arch: os.arch(),
    nodeVersion: process.version,
    uptime: formatUptime(process.uptime()),
    uptimeSeconds: Math.floor(process.uptime()),
    cpu: {
      model: os.cpus()[0]?.model || 'Unknown',
      cores: os.cpus().length,
      usage: getCpuUsage(),
      loadAvg: os.loadavg().map(l => Math.round(l * 100) / 100)
    },
    memory: getMemoryUsage(),
    processMemory: getProcessMemory()
  };
}

module.exports = {
  getCpuUsage,
  getMemoryUsage,
  getProcessMemory,
  getPodInfo,
  getSystemSnapshot,
  formatUptime
};
