# 07 — Monitoring Setup

## 🎯 What You'll Learn
- How Prometheus scraping works
- Accessing Prometheus and Grafana UIs
- Creating a Grafana dashboard
- Writing PromQL queries

---

## How Prometheus Works

```
┌──────────────┐         ┌──────────────┐
│  CloudPulse  │         │  Prometheus  │
│  Backend     │ ◄─────  │  Server      │
│  /metrics    │  scrape  │              │
│              │  every   │  Stores time │
│  Exposes:    │  15 sec  │  series data │
│  - counters  │         │              │
│  - gauges    │         └──────┬───────┘
│  - histograms│                │
└──────────────┘         ┌──────↓───────┐
                         │  Grafana     │
                         │  Queries     │
                         │  Prometheus  │
                         │  → Dashboards│
                         └──────────────┘
```

**Prometheus PULLS metrics** (unlike most logging systems that PUSH). Every 15 seconds, it sends an HTTP GET to `/metrics` on your backend.

---

## Access Prometheus

```bash
# Prometheus is exposed on NodePort 30090
# URL: http://YOUR_EC2_IP:30090

# Verify it's scraping the backend:
# 1. Go to http://YOUR_EC2_IP:30090
# 2. Click "Status" → "Targets"
# 3. You should see "cloudpulse-backend-static" with State = UP
```

### Useful PromQL Queries

Type these in the Prometheus query box:

```promql
# Total HTTP requests
cloudpulse_http_requests_total

# Request rate (requests per second over last 5 minutes)
rate(cloudpulse_http_requests_total[5m])

# Average response time
rate(cloudpulse_http_request_duration_seconds_sum[5m]) / rate(cloudpulse_http_request_duration_seconds_count[5m])

# Memory usage percentage
cloudpulse_active_requests

# Application uptime
cloudpulse_uptime_seconds

# Node.js heap usage
process_heap_bytes / 1024 / 1024
```

---

## Access Grafana

```bash
# Grafana is exposed on NodePort 30030
# URL: http://YOUR_EC2_IP:30030
# Login: admin / cloudpulse123
```

### Create a Dashboard

1. **Login** → admin / cloudpulse123
2. Click **"+"** → **"New Dashboard"**
3. Click **"Add visualization"**
4. Select **"Prometheus"** as data source (auto-provisioned!)

### Panel 1: Request Rate
- **Query:** `rate(cloudpulse_http_requests_total[5m])`
- **Visualization:** Time series
- **Title:** "HTTP Request Rate"

### Panel 2: Response Time
- **Query:** `rate(cloudpulse_http_request_duration_seconds_sum[5m]) / rate(cloudpulse_http_request_duration_seconds_count[5m])`
- **Visualization:** Gauge
- **Title:** "Average Response Time"

### Panel 3: Active Requests
- **Query:** `cloudpulse_active_requests`
- **Visualization:** Stat
- **Title:** "Active Requests"

### Panel 4: Uptime
- **Query:** `cloudpulse_uptime_seconds / 3600`
- **Visualization:** Stat
- **Title:** "Uptime (hours)"
- **Unit:** hours

### Panel 5: Node.js Memory
- **Query:** `process_resident_memory_bytes / 1024 / 1024`
- **Visualization:** Time series
- **Title:** "Process Memory (MB)"

5. Click **"Save Dashboard"** → Name: "CloudPulse Overview"

---

## Monitoring Concepts for Interviews

| Concept | Explanation |
|---------|-------------|
| **Scraping** | Prometheus periodically fetches metrics from targets |
| **Target** | An endpoint that exposes metrics (/metrics) |
| **Exporter** | A component that converts metrics to Prometheus format |
| **PromQL** | Prometheus Query Language for querying time-series data |
| **Alert** | Notification triggered when a metric crosses a threshold |
| **Dashboard** | Visual representation of metrics in Grafana |

---

## ✅ Checkpoint

- [ ] Prometheus UI accessible at :30090
- [ ] Backend shows as "UP" target in Prometheus
- [ ] Grafana UI accessible at :30030
- [ ] Created at least one dashboard panel

**Next:** [08 — Ingress Setup →](08-ingress-setup.md)
