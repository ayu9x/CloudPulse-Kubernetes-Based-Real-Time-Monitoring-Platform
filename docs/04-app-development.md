# 04 — Application Development

## 🎯 What You'll Learn
- Backend API architecture and code walkthrough
- Frontend dashboard components
- Prometheus metrics integration
- How the frontend and backend communicate

---

## Backend Architecture

The backend is an **Express.js** REST API server that:
1. Exposes status, health, metrics, and logs endpoints
2. Collects Prometheus-compatible metrics
3. Logs every request with structured logging (Winston)
4. Provides system information (CPU, memory, pod data)

### API Endpoints

| Endpoint | Method | Purpose | Response |
|----------|--------|---------|----------|
| `/` | GET | API info | Service name, version, available endpoints |
| `/api/health` | GET | Health check | Status, uptime, version (used by K8s probes) |
| `/api/status` | GET | Server status | CPU, memory, pods, cluster info |
| `/api/metrics` | GET | App metrics (JSON) | Request count, response times, history |
| `/api/logs` | GET | Recent logs | Last 50 log entries from ring buffer |
| `/metrics` | GET | Prometheus metrics | Prometheus exposition format |

### Testing the API

```bash
# After starting the backend (npm start or docker run):

# Health check
curl http://localhost:8080/api/health
# Returns: {"status":"healthy","uptime":120,"version":"1.0.0",...}

# Server status
curl http://localhost:8080/api/status
# Returns: {"status":"operational","server":{...},"pods":[...],...}

# Application metrics (JSON for dashboard)
curl http://localhost:8080/api/metrics
# Returns: {"current":{"cpu":15.2,"memory":{...}},"requests":{...},"history":[...]}

# Prometheus metrics (Prometheus scrapes this)
curl http://localhost:8080/metrics
# Returns: # HELP cloudpulse_http_requests_total Total number of HTTP requests...

# Recent logs
curl http://localhost:8080/api/logs?limit=5
# Returns: {"count":5,"logs":[{"timestamp":"...","level":"info","message":"..."}]}
```

---

## Prometheus Metrics Explained

The backend exposes four custom Prometheus metrics:

### 1. Counter: `cloudpulse_http_requests_total`
```
# Counts total HTTP requests (only goes UP)
cloudpulse_http_requests_total{method="GET",route="/api/health",status_code="200"} 42
```

### 2. Histogram: `cloudpulse_http_request_duration_seconds`
```
# Measures request latency distribution
cloudpulse_http_request_duration_seconds_bucket{le="0.01"} 38
cloudpulse_http_request_duration_seconds_bucket{le="0.05"} 41
```

### 3. Gauge: `cloudpulse_active_requests`
```
# Current number of in-flight requests (goes UP and DOWN)
cloudpulse_active_requests 3
```

### 4. Gauge: `cloudpulse_uptime_seconds`
```
# How long the server has been running
cloudpulse_uptime_seconds 3600
```

> **💡 Metric Types:** In Prometheus, **Counter** only increases (requests, errors), **Gauge** goes up and down (temperature, active users), **Histogram** measures distributions (latency percentiles).

---

## Frontend Architecture

The React dashboard auto-refreshes every 5 seconds and displays:

| Component | Data Source | What It Shows |
|-----------|-------------|---------------|
| **StatusCards** | `/api/status`, `/api/metrics` | CPU, memory, requests, pods, uptime |
| **MetricsChart** | `/api/metrics` (history array) | Real-time CPU & memory line charts |
| **HealthIndicator** | `/api/health` | API endpoint status, health checks |
| **PodMonitor** | `/api/status` (pods array) | Pod names, status, CPU, memory |
| **LogsPanel** | `/api/logs` | Recent application log entries |

### Data Flow
```
Frontend (React)
    ↓ every 5 seconds
    ↓ axios.get() to all 4 endpoints
    ↓ in parallel (Promise.all)
Backend (Express)
    ↓ reads os.cpus(), os.freemem()
    ↓ reads Prometheus registry
    ↓ reads log ring buffer
    ↓ returns JSON responses
Frontend
    ↓ setState() with new data
    ↓ React re-renders components
    ↓ Recharts updates graphs
Dashboard is live! ⚡
```

---

## ✅ Checkpoint

- [ ] You understand each API endpoint and its purpose
- [ ] You know the 3 Prometheus metric types (Counter, Gauge, Histogram)
- [ ] You understand how the frontend polls the backend

**Next:** [05 — Dockerization →](05-dockerization.md)
