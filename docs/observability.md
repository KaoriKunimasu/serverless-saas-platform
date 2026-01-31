# Observability – Project A (Serverless SaaS)

This document describes how observability is implemented for Project A,
including dashboards, alarms, notifications, and operational runbooks.

The goal is to enable fast detection, diagnosis, and recovery from failures
using minimal but sufficient AWS-native tooling.

---

## Scope

- Environment: dev
- Platform: AWS Lambda + API Gateway (HTTP API)
- Tooling: CloudWatch (Logs, Metrics, Alarms, Dashboard), SNS (email)

No external APM or tracing tools are used at this stage.

---

## Dashboards

### CloudWatch Dashboard
- **Name:** `project-a-dev-overview`

This dashboard provides a single entry point for operational visibility.

### Widgets
- API Lambdas
  - Invocations
  - Errors
  - Duration (p95)
- Summary Lambda
  - Invocations
  - Errors
- Alarm status overview

Use this dashboard first when an alarm is triggered.

---

## Alarms

### Summary Lambda Errors
- **Alarm name:** `project-a-dev-summary-errors`
- **Metric:** `AWS/Lambda Errors`
- **Threshold:** ≥ 1 error within 5 minutes

**Runbook:**  
- [`docs/runbooks/alarms/summary-errors.md`](runbooks/alarms/summary-errors.md)

---

### API Lambda Errors
- **Alarm names:**
  - `project-a-dev-createItem-errors`
  - `project-a-dev-listItems-errors`
- **Metric:** `AWS/Lambda Errors`
- **Threshold:** ≥ 1 error within 5 minutes

Runbooks to be added:
- `docs/runbooks/alarms/createitem-errors.md`
- `docs/runbooks/alarms/listitems-errors.md`

---

### API Duration (p95)
- **Alarm name:** `project-a-dev-api-duration-p95`
- **Metric:** `AWS/Lambda Duration (p95)`
- **Threshold:** > 3000 ms

This alarm is used to detect performance degradation rather than outright failure.

Runbook to be added:
- `docs/runbooks/alarms/api-duration-p95.md`

---

## Notifications

### SNS Topic
- **Topic name:** `project-a-alerts-dev`
- **Protocol:** Email

All alarms send notifications to this topic.

---

## Logs

### Lambda Logs
- Log groups: `/aws/lambda/<function-name>`
- Log retention: **1 month**

Structured JSON logging is used to include:
- request identifiers
- route information
- error details

Logs are the primary source for root cause analysis.

---

## Operational Flow (When an Alarm Fires)

1. Receive SNS email notification.
2. Open the CloudWatch alarm to confirm scope.
3. Open the **project-a-dev-overview** dashboard.
4. Navigate to the affected Lambda log group.
5. Follow the linked runbook for that alarm.
6. Fix and redeploy via CI (`deploy-dev`).

---

## Verification

Alarm delivery was manually verified by forcing a controlled failure in the
Summary Lambda and confirming SNS email notification delivery.

This verification process is documented in the corresponding runbook.

---

## Design Rationale

- CloudWatch-only observability is sufficient at this scale.
- Logs → Metrics → Alarms provide a clear operational hierarchy.
- Each alarm maps to a single runbook.
- The focus is on explainability and operational readiness rather than tooling breadth.

---

## Future Improvements (Out of Scope)
- Distributed tracing (AWS X-Ray)
- External alerting platforms (PagerDuty, Opsgenie)
- Automated remediation
