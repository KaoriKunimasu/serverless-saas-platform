# Runbook: Rollback (Project B API)

## Purpose
Rollback to a previous stable task definition.

## Steps
1. List task definitions
aws ecs list-task-definitions --family-prefix project-b-dev-api

2. Update service
aws ecs update-service \
  --cluster project-b-dev-cluster \
  --service project-b-dev-api \
  --task-definition <previous-revision>

## Verification
curl http://<ALB>/health
