# Rollback – ECS Service

This service runs behind an ALB and uses ECS rolling deployments.

If a new deployment causes errors or unhealthy tasks, roll back to a previous task definition revision.

---

## 1. Check current task definition

aws ecs describe-services \
  --cluster project-b-dev-cluster \
  --services project-b-dev-api \
  --query "services[0].taskDefinition" \
  --output text

---

## 2. List recent revisions

aws ecs list-task-definitions \
  --family-prefix project-b-dev-api \
  --sort DESC \
  --max-items 10

---

## 3. Roll back to a previous revision

aws ecs update-service \
  --cluster project-b-dev-cluster \
  --service project-b-dev-api \
  --task-definition project-b-dev-api:<REVISION> \
  --force-new-deployment

---

The service will perform another rolling update and restore the previous version without downtime.
