# Observability

This document describes how observability is implemented across all portfolio projects.

## Goal

- Detect failures quickly
- Diagnose root causes fast
- Recover safely

AWS-native tooling only (no external APM).

---

## Stack

- CloudWatch Logs
- CloudWatch Metrics
- CloudWatch Alarms
- CloudWatch Dashboards
- SNS (email notifications)

---

## Architecture Pattern
```
Logs → Metrics → Alarms → Runbook
```

Each alarm must:
- have a clear signal
- link to a runbook
- include a recovery procedure

---

# Project A – Serverless SaaS (Lambda)

## Platform
Lambda + API Gateway

## Dashboard
`project-a-dev-overview`

## Alarms
- Summary Lambda Errors
- API Lambda Errors
- API Duration p95

## Logs
`/aws/lambda/<function-name>`

## Notifications
SNS → email

## Runbooks
`docs/runbooks/alarms/`

---

# Project B – ECS Fargate

## Platform
ECS Fargate + ALB + RDS

## Metrics
- ECS CPUUtilization
- ALB 5xx count
- Task health

## Alarms
- ALB target 5xx
- ECS CPU high (autoscaling)
- optional: memory high

## Autoscaling
Target tracking:
- CPU 70%
- min 1
- max 3
- cooldown 60/180

## Logs
`/ecs/project-b-dev-api`

## Smoke Test
- `/health`
- `/burn`
- `/db-check`

## Notes
Transient 5xx/504 may occur during deployments.
Retry logic is implemented in CI smoke tests.

## Runbooks
`docs/runbooks/project-b/`