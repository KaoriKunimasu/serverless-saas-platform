# Engineering Standards

This document defines baseline engineering standards for security, delivery, and operations.
These standards apply to services and infrastructure defined in this repository.

## Environments
Stages: `dev`, `prod`
- dev: cost-optimized, lower retention
- prod: protection and retention enabled

Conventions:
- resource naming includes `stage`
- required tags: `project`, `stage`, `owner`

## CI/CD
PR must run:
- install
- lint
- unit tests
- build
- IaC validation:
  - Project A: `cdk synth`
  - Project B: `terraform fmt -check` and `terraform validate`

Main branch:
- deploys to `dev`
- uses GitHub OIDC (no static credentials)
- rollback steps are documented per project

## IAM & Secrets
Principles:
- least privilege
- separate roles for CI/CD, runtime, and human access
- no long-lived access keys for CI/CD

CI/CD:
- GitHub Actions assumes an IAM role via OIDC
- trust policy restricted by repo/branch and audience `sts.amazonaws.com`

Secrets:
- never stored in repo
- use Secrets Manager or SSM Parameter Store
- never log sensitive values

## Data Protection
DynamoDB (Project A):
- PITR enabled in prod
- stage-specific removal policy (dev may destroy; prod retain/protect)

RDS (Project B):
- encryption at rest
- backups enabled
- credentials stored in Secrets Manager

## Logging & Observability
Logging:
- structured JSON logs
- stage-specific retention

Alarms (minimum):
- Project A: Lambda errors, API Gateway 5xx/latency
- Project B: ALB 5xx/latency, ECS task restarts, RDS CPU/storage

Runbooks:
- short recovery steps live in `docs/runbooks/`

## Incident Documentation
Incident write-ups follow this format:
- summary
- detection
- root cause
- recovery
- prevention

Location: `docs/incidents/`
