# Dynatrace Telemetry Crash Course: Engineering KPIs for Automation

## 🎯 Mission Statement
To ensure all infrastructure automation, scripts, and custom applications speak the same language. By standardizing our telemetry, we enable unified dashboards, automated alerting, and the ability to drill down from high-level department health to specific script performance with a single click.

---

## 1. The Anatomy of a Custom Metric
A metric is not just a number; it is a structured piece of data consisting of three distinct components.

### The Three Pillars
1.  **The Metric Key**: The unique identifier (the "Name") used to find the data. 
    *   *Example*: `custom.Infracode_script_template.runtime.success`
2.  **The Dimension**: The metadata or "tags" attached to the key. Dimensions allow you to **filter** and **group** data.
    *   *Example*: `environment: production`, `region: us-east-1`
3.  **The Value**: The actual numerical data point.
    *   *Example*: `1` (for a success count) or `50.5` (for GB used).

### How to Send Data
There are two primary ways to inject this data into Dynatrace:
*   **Dynatrace API v2 (Recommended for Scripts)**: Use a simple `POST` request to the `/metrics/inbound` endpoint. This is ideal for PowerShell, Python, or Bash scripts running in automation.
*   **OneAgent**: For custom-developed applications, the OneAgent can automatically capture certain metrics, but for specialized automation telemetry, the API is your primary tool.

---

## 2. The KPI Mindname: Metrics vs. Logs
One of the biggest mistakes in observability is treating logs like metrics. 

### The Decision Tree
Ask yourself: **"Do I need to see a trend/count, or do I need to read a story?"**

| Feature | **Metrics (KPIs)** | **Logs (Events)** |
| :--- | :--- | :--- |
| **Format** | Numerical / Aggregated | Textual / Detailed |
| **Question it answers** | "Is the system healthy?" | "What exactly happened?" |
| **Use Case** | Dashboards, Alerting, Trends | Forensic investigation, Root cause |
| **Example** | "Total failed backups: 5" | "Error: Backup failed on Disk 02 due to timeout" |

### How to Engineer a Metric
When building automation, don't just "send data." Start with a question:
1.  **Identify the Question**: "How much storage space is left on our automation nodes?"
2.  **Identify the Raw Data**: We need a number representing GB.
3.  **Determine the Metric Structure**: If we name it correctly, we can see this across all nodes simultaneously.

---

## 3. Deep Dive: The Standardized Naming Hierarchy

To create a truly observable ecosystem, we differentiate between **Global/Departmental Rollups** (the "Executive" view) and **Component-Specific Metrics** (the "Engineer" view).

### Scenario A: Global/Departmental Rollup
*Goal: High-level visibility for a global dashboard to monitor the health of all automation across the entire Infracode department.*

| Group.SubGroup Identifier | Metric Purpose | Primary Dimension (To enable filtering) |
| :--- | :--- | :--- |
| `runtime.success_count` | Total successful automation executions. | `automation_type` (e.g., PowerShell, Python) |
| `runtime.failure_count` | Total failed automation executions. | `automation_type` |
| `execution.duration_sec` | Latency of global automation workflows. | `workflow_id` |
| `api.latency_ms` | Performance of shared internal API calls. | `endpoint_name` |
| `resource.usage_percent` | Overhead of automation runners/nodes. | `runner_id` |
| `security.compliance_score` | Compliance/Governance check status. | `policy_id` |
| `deployment.status_count` | Tracking deployment/provisioning activity. | `environment` (Dev, Prod) |
| `network.throughput_mbps` | Data transfer rates across automation pipelines. | `region` (e.g., us-east-1) |
| `auth.failure_count` | Security monitoring for credential/access issues. | `service_account_id` |
| `job.queue_depth` | Monitoring the backlog of pending automation tasks. | `queue_name` |

### Scenario B: Specific Use Case (Orphaned Disk Cleanup Script)
*Goal: Deep-dive telemetry for a specialized script that finds, classifies, stages, and removes orphaned disks across vCenters and datastores.*

| Group.SubGroup Identifier | Metric Purpose | Primary Dimension (To enable filtering) |
| :--- | :--- | :--- |
| `disk.detection.count` | Total number of candidate disks identified. | `vcenter_id` |
| `disk.staging.volume_gb` | Total storage volume currently "staged" for removal. | `datastore_name` |
 | `disk.removal.count` | Total number of disks successfully deleted. | `datastore_name` |
| `disk.error.count` | Count of failures during the removal process. | `vcenter_id` |
| `disk.classification.orphaned` | Count of strictly "orphaned/unattached" disks. | `disk_type` (SSD, HDD) |
| `disk.classification.unattached` | Count of unattached disks found in scans. | `disk_type` |
| `disk.target.count` | Number of vCenters/Datastores actively processed. | `region` |
| `disk.process.duration_sec` | Time taken to complete one full cleanup cycle. | `execution_mode` (Dry-run vs Live) |
| `disk.revert.count` | Number of disks restored/un-staged from staging. | `reason` (Manual override) |
| `disk.cleanup_cycle.age_days` | How long disks have remained in the "staged" state. | `storage_tier` (Gold, Silver) |

### Scenario C: Metric Derivation via Question-Driven Engineering
*Goal: Translating business/operational requirements into technical metric keys.*

| Metric Key Example | Engineering Question (The "Why") |
| :--- | :--- |
| **Global Disk Cleanup** | |
| `disk.cleanup.unused_snapshots` | How many snapshots are not attached to any running VM? |
| `disk.cleanup.old_backups` | How many backups are older than our 3-day retention policy? |
| `disk.cleanup.temp_logs` | How much space is being consumed by logs that haven't been rotated in 7 days? |
| `disk.cleanup.orphaned_volumes` | How many volumes are in an 'available' state but haven't been used in 14 days? |
| `disk.cleanup.temporary_disks` | How many disks were created by automated scripts but never deleted? |
| **Orphaned Disk Cleanup** | |
| `disk.cleanup.unattached_vhd` | Are there VHD files in storage that are no longer associated with a Virtual Machine? |
| `disk.cleanup.zerto_vpg_orphaned_disks` | Are there disks present in the storage layer that are no longer part of any Zerto VPG? |
| `disk.cleanup.detached_ebs_volumes` | How many EBS volumes are in the 'available' status rather than 'in-use'? |
| `disk.cleanup.leftover_isv_disks` | Are there disks left over from decommissioned ISV appliances? |
| `disk.cleanup.abandoned_ssd_tiers` | How many high-performance SSD disks are currently not attached to any compute instance? |

---

## 4. Pitfalls & The "Cardinality Explosion"
The most dangerous mistake in telemetry is **High Cardinality**.

### ❌ The Cardinality Trap
**Cardinality** is the number of unique values in your dimensions.
*   **Good (Low Cardinality)**: A dimension called `status` with values `[success, failure]`. (Only 2 possibilities).
*   **Bad (High Cardinality)**: A dimension called `user_id` or `request_id` where every single value is unique.

**Why is this bad?**
If you send a unique `order_id` as a dimension, Dynatrace has to create a new time-series line for every single order. This causes:
1.  **Cost Spikes**: You are paying for thousands of unique metrics.
2.  **Performance Degradation**: Dashboards will crawl or fail to load.
3.  **Noise**: You lose the ability to see high-level trends because the data is too fragmented.

### ✅ The Golden Rules
1.  **Never** use Timestamps, UUIDs, or Usernames as **Dimensions**.
2.  **Always** use Categories (e.g., `Region`, `Environment`, `ServiceTier`) as **Dimensions**.
3.  **Keep it Aggregated**: If you need to know which specific ID failed, put that ID in a **Log**, not a **Metric**.
