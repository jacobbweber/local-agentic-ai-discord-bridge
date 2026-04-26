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


---
Since you are using PowerShell, you have a lot of flexibility here. To build a **scalable, repeatable metric system**, you need to think like a database architect: keep the metric names generic and use **Dimensions** to provide the context.

If you create a specific metric name for every new script, your dashboards will become a nightmare to maintain. Instead, use a "Generic Schema" approach.

### 1. The Recommended Metric Schema
Instead of hardcoding "staged" or "removed" into the metric name, use a generic `space_bytes` metric and differentiate the action with a `status` or `action` dimension.

| Metric Name | Dimension 1 (Script) | Dimension 2 (Context) | Dimension 3 (Target) |
| :--- | :--- | :--- | :--- |
| `infracode.script.runtime` | `script_name` | `vcenter_name` | `status` (success/fail) |
| `infracode.script.space_gb` | `script_name` | `vcenter_name` | `action` (staged/removed/total) |
| `infracode.script.object_count`| `script_name` | `vcenter_name` | `classification` (content_lib/orphaned/etc) |

---

### 2. Mapping Your KPIs to the Schema

Using this approach, here is how you would send your specific data points:

#### Execution Frequency
* **Metric:** `custom.infracode.script.runtime.count`
* **Dimensions:** `script_name:odc`, `vcenter_name:vc01`, `status:success`
* **Logic:** Send a `1` every time the script finishes.

#### Space Management (Staged vs. Removed)
Instead of two metrics, use one and split by a dimension. This allows you to create a single "Space Impact" chart where "Staged" and "Removed" are different colored bars.
* **Metric:** `custom.infracode.script.space_gb`
* **Dimensions:** `script_name:odc`, `vcenter_name:vc01`, **`type:staged`** OR **`type:removed`**
* **Lifetime Logic:** To get "Total Lifetime," you don't need a separate metric. In Dynatrace, you simply change the dashboard visualization from "Rate" to **"Cumulative Sum"** or **"Total."**

#### Classification & Skips
* **Metric:** `custom.infracode.script.object_count`
* **Dimensions:** `script_name:odc`, `vcenter_name:vc01`, **`category:skipped_content_lib`**, **`category:orphaned_deleted`**
* **Logic:** This satisfies your requirement to see *why* things were handled a certain way.

---

### 3. Implementation Best Practice: The "Payload"
Since you are using PowerShell, I recommend building a "Metric Helper" function. You don't want to care about the formatting every time. Your script logic should look like this:

```powershell
# Example: Sending the staged space
$Dimensions = @{
    script_name  = "odc"
    vcenter_name = "vc-prod-01"
    action       = "staged"
}
Send-DynatraceMetric -MetricName "infracode.script.space_gb" -Value 450 -Dimensions $Dimensions
```

---

### 4. Addressing your "Lifetime" Struggle
You mentioned wanting to track "Total Lifetime" space removed. 
**Crucial Tip:** Do not try to calculate the "Lifetime Total" inside your PowerShell script and send that number. If the script fails to send once, your "Total" becomes inaccurate.

**The Dynatrace Way:**
1.  Send the **delta** (the amount removed *this run*).
2.  In Dynatrace, use the **Data Explorer**.
3.  Select your metric and use the transformation **`Cumulative Sum`**. 

This makes your script "stateless." The script only knows what it did *right now*, and Dynatrace handles the historical math. This is much more robust because if you reran the script for a specific VC, it wouldn't double-count a hardcoded total.

### 5. Managing Dimensions
You mentioned `classifcication BY classification`. To keep this scalable, ensure your classification names are **clean strings** (no spaces, no special characters). 

**Example Classifications:**
* `active_disk`
* `orphaned_staged`
* `excluded_content_lib`
* `excluded_manual_tag`

Does the idea of using "Action/Type" dimensions instead of unique metric names make sense for your dashboarding goals, or do you prefer the visibility of separate metric names?


To build this out properly, we will follow the "Generic Schema" approach. This ensures that when you write a *second* script (e.g., a "Snapshot Cleanup" script), you don't have to invent new metric names—you just change the `script_name` dimension.

Here is a list of exactly what your PowerShell script should send to Dynatrace, formatted as **Metric Ingest Lines**.

### 1. Execution Heartbeat (The "Run Count")
This answers: *How many times did it run, where, and did it finish?*

* **Metric Name:** `custom.infracode.script.runtime.count`
* **Dimensions:** `script_name`, `vcenter_name`, `status`
* **Examples:**
    * `custom.infracode.script.runtime.count,script_name=odc,vcenter_name=vc-us-east,status=success 1`
    * `custom.infracode.script.runtime.count,script_name=odc,vcenter_name=vc-eu-west,status=error 1`

---

### 2. Space Management (The "Volume" Metrics)
Instead of separate metrics for "Staged" vs "Removed," we use the `action` dimension. This allows you to stack them in a single chart to show "Potential vs. Actual" savings.

* **Metric Name:** `custom.infracode.script.space_gb`
* **Dimensions:** `script_name`, `vcenter_name`, `action`
* **Examples:**
    * **Staged this run:** `custom.infracode.script.space_gb,script_name=odc,vcenter_name=vc-us-east,action=staged 450.5`
    * **Removed this run:** `custom.infracode.script.space_gb,script_name=odc,vcenter_name=vc-us-east,action=removed 125.0`
    * **Total Identified (Inventory):** `custom.infracode.script.space_gb,script_name=odc,vcenter_name=vc-us-east,action=total_orphaned 1200.0`

> **Note on Lifetime:** To see "Total Lifetime Removed," you do not send a new metric. In the Dynatrace Data Explorer, you select the `action=removed` metric and change the **Aggregation** from `Value` to `Cumulative Sum`.

---

### 3. Classification & Logic (The "Why" Metrics)
This answers: *What did the script find, and why did it skip certain things?* This uses a `classification` dimension to track the count of files/disks.

* **Metric Name:** `custom.infracode.script.object_count`
* **Dimensions:** `script_name`, `vcenter_name`, `classification`
* **Examples:**
    * **Skipped Content Libs:** `custom.infracode.script.object_count,script_name=odc,vcenter_name=vc-us-east,classification=skip_content_lib 24`
    * **Skipped Templates:** `custom.infracode.script.object_count,script_name=odc,vcenter_name=vc-us-east,classification=skip_template 12`
    * **Orphaned Disks Found:** `custom.infracode.script.object_count,script_name=odc,vcenter_name=vc-us-east,classification=orphaned_detected 8`
    * **Success Deletions:** `custom.infracode.script.object_count,script_name=odc,vcenter_name=vc-us-east,classification=deleted_success 5`

---

### How to use these in a Dashboard
By sending the data this way, you can build a powerful "Orphaned Disk Overview" dashboard with just three tiles:

| Tile Type | Data Source | Visualization |
| :--- | :--- | :--- |
| **Health** | `runtime.count` | **Single Value:** Count of successful runs vs failures per VC. |
| **Space Impact** | `space_gb` (filtered by `action`) | **Bar Chart:** Compare "Staged" vs "Removed" side-by-side. |
| **The "Why"** | `object_count` | **Pie Chart:** Showing the ratio of "Deleted" vs "Skipped (Content Lib)" vs "Skipped (Template)". |
| **Historical ROI** | `space_gb` (action=removed) | **Area Chart:** Use "Cumulative Sum" to show the line going up over months as you reclaim TBs of space. |

---

### Pro-Tip: The "Script Metadata" Event
Since we are avoiding GUIDs in metrics, I highly recommend sending one **Custom Info Event** at the end of every script run. This is where you put the "high cardinality" data that you don't want in your metrics.

**PowerShell Logic:**
```powershell
$EventPayload = @{
    eventType = "CUSTOM_INFO"
    title = "Orphaned Disk Cleanup Completed"
    entitySelector = "type(vcenter),name($vcenterName)"
    properties = @{
        "script_run_id" = $GlobalGUID  # This is where the GUID goes!
        "vc_name" = $vcenterName
        "total_disks_processed" = $totalCount
        "log_path" = "\\server\logs\odc_$GlobalGUID.log"
    }
}
# Send this to the /api/v2/events endpoint
```

This way, if someone sees a "Failure" on your metric dashboard, they can look at the **Events** on that same timeframe to find the exact **GUID** and **Log Path** to go troubleshoot.

Does this classification list cover all the "skips" and "actions" you were envisioning for your VMware logic?



To build a truly scalable system for your department, you need to establish a **Unified Dimension Strategy**. This ensures that whether you are looking at a PowerShell script for VMware or a Go-based app like "SANMAN," the filtering experience in Dynatrace remains consistent.

Here are 10 dimensions that will help you differentiate between scripts, apps, and systems within the **Infracode** department.

---

### 1. `app_name` / `project_name`
This is your top-level filter. It groups multiple scripts or services under one logical umbrella.
* **Why:** Even if you have 5 different scripts for SAN management, they all roll up to "SANMAN."
* **Example:** `app_name=sanman`, `app_name=vm_lifecycle`

### 2. `env_stage`
Differentiates between where the script is running or what it is targeting.
* **Why:** You don't want your "Lab" cleanup metrics skewing your "Production" capacity dashboards.
* **Example:** `env_stage=prod`, `env_stage=lab`, `env_stage=staging`

### 3. `execution_context` (The "Where")
Identifies the platform or engine that triggered the script.
* **Why:** Helps you determine if a failure is a script bug or an issue with the automation platform.
* **Example:** `execution_context=github_actions`, `execution_context=ansible_tower`, `execution_context=windows_task_scheduler`

### 4. `target_provider`
Identifies the underlying technology being managed.
* **Why:** Essential for a department that manages hybrid infra. It allows you to create one dashboard and filter by "AWS" vs "VMware."
* **Example:** `target_provider=vmware`, `target_provider=aws`, `target_provider=pure_storage`

### 5. `script_version` / `app_version`
Tracks the version of the code sending the telemetry.
* **Why:** If you push a code update that accidentally starts double-counting "orphaned disks," you can see exactly when the trend line shifted based on the version.
* **Example:** `version=1.4.2-beta`, `version=2024.11.0`

### 6. `site_region`
The physical or logical location of the infrastructure being acted upon.
* **Why:** You might want to see if "Orphaned Disks" are a bigger problem in your European datacenters versus US ones.
* **Example:** `region=us-east-1`, `region=lon-dc-05`

### 7. `trigger_source` (The "Who/How")
Identifies if the run was a scheduled event or a manual intervention.
* **Why:** Helps explain anomalies. A massive spike in "Space Removed" might be normal if the `trigger_source` was `manual_adhoc`.
* **Example:** `trigger_source=scheduled`, `trigger_source=manual_user_jsmith`

### 8. `team_owner`
The specific sub-group within "Infracode" responsible for the tool.
* **Why:** In a large department, this allows the "Storage Team" to have a dashboard that automatically excludes "Compute Team" metrics.
* **Example:** `team_owner=storage_ops`, `team_owner=virtualization_eng`

### 9. `target_criticality`
The importance of the systems the script is touching.
* **Why:** You might treat an error in a `criticality=tier_0` environment much differently than a `tier_3` sandbox.
* **Example:** `criticality=p1_production`, `criticality=p4_sandbox`

### 10. `host_origin`
The specific machine/server where the script is actually executing.
* **Why:** If your script runs fine on `Worker-Node-01` but fails on `Worker-Node-02`, this dimension reveals that the issue is likely a missing module or permission on that specific host.
* **Example:** `host_origin=svc-powershell-01.corp.local`

---

### How this looks in practice (The "Side-by-Side")

If you use these dimensions, your metric ingestion lines would look beautifully organized even for two completely different tools:

**The ODC Script:**
> `custom.infracode.script.object_count,app_name=odc,env_stage=prod,target_provider=vmware,region=us-east,classification=deleted_success 5`

**The SANMAN App:**
> `custom.infracode.script.object_count,app_name=sanman,env_stage=prod,target_provider=pure_storage,region=us-east,classification=lun_retired 2`

### Pro-Tip for Scalability
When you build your PowerShell "Metric Sender" function, make sure it automatically includes **App Name, Env, and Version** by default. That way, your teammates don't have to remember to add them every time—they just focus on the specific classification they care about.

Do you have a specific naming convention for your "Apps" (like SANMAN) already, or are you looking to standardize those as well?