# Project B API - Deployment Runbook

## Purpose

Deploy a new API image to ECS (dev) using GitHub Actions, verify quickly, then return to near-zero cost.

---

## Preconditions

- You are in `infra/b-ecs/envs/dev`
- Terraform backend is configured and state is reachable
- Workflow: `Project B - deploy dev (api)` is enabled

---

## Operating Modes

### Default (Idle / Cost-Saving)

Infrastructure is off:

```hcl
enable_nat    = false
enable_alb    = false
desired_count = 0
```

**Expected:** ALB does not exist → `curl` will fail.

### Demo / Verification (Temporary)

Turn infrastructure on briefly, verify, then turn off.

---

## Deployment Workflow

### 1. Start (Demo / Verification)

```bash
terraform apply -auto-approve \
  -var="enable_nat=true" \
  -var="enable_alb=true" \
  -var="desired_count=1"
```

**Get ALB DNS:**

```bash
ALB=$(terraform output -raw alb_dns_name)
echo "$ALB"
```

**Wait until healthy (retry):**

```bash
for i in $(seq 1 30); do
  code=$(curl -s -o /tmp/health.json -w "%{http_code}" "http://${ALB}/health" || true)
  echo "try $i: http=$code body=$(cat /tmp/health.json 2>/dev/null || true)"
  [ "$code" = "200" ] && break
  sleep 10
done
```

---

### 2. Deploy

**Trigger:**
- Push changes to `main` or `project-b/*` branch
- Or run manually via `workflow_dispatch`

**What happens:**

1. GitHub Actions builds and pushes a new immutable ECR tag
2. Updates ECS task definition to the new image
3. Waits for service stability
4. Runs smoke test (skipped if ALB is disabled/not found)

---

### 3. Verify (Manual)

```bash
curl "http://${ALB}/health"
curl "http://${ALB}/db-check"
```

**Expected:**

- `/health` → `200`
- `/db-check` → `200` (may fail briefly if DB is starting)

---

### 4. Stop (Return to Idle / Near-Zero Cost)

**Scale down first:**

```bash
terraform apply -auto-approve -var="desired_count=0"
```

**Then remove ALB/NAT:**

```bash
terraform apply -auto-approve \
  -var="enable_alb=false" \
  -var="enable_nat=false"
```

---

## Troubleshooting

### 503 from ALB

**Most common causes:**

- ECS task not running yet / still registering
- Target group health check failing (wrong port/path, app not ready)
- Security group rules prevent ALB → ECS traffic

**Fast checks:**

#### Service events / task status:

```bash
aws ecs describe-services \
  --cluster "$(terraform output -raw ecs_cluster_name)" \
  --services "${TF_VAR_project}-${TF_VAR_env}-api" \
  --query "services[0].events[:5].[createdAt,message]" \
  --output table
```

> **Note:** If your service name isn't exposed, use: `aws ecs list-services --cluster ...`

#### ALB target health:

```bash
aws elbv2 describe-target-health --target-group-arn <target-group-arn>
```

**Logs:**

- ECS task logs (CloudWatch)
- GitHub Actions deploy job logs

---

### `/db-check` fails but `/health` is 200

**Possible causes:**

- DB may still be starting
- Credentials not injected correctly

**Check:**

- RDS status
- Verify Secrets Manager ARN in task definition

---

## Quick Reference

### Start Infrastructure

```bash
terraform apply -auto-approve \
  -var="enable_alb=true" \
  -var="enable_nat=true" \
  -var="desired_count=1"

ALB=$(terraform output -raw alb_dns_name)

curl "http://${ALB}/health"
curl "http://${ALB}/db-check" || true
```

### Stop Infrastructure

```bash
terraform apply -auto-approve -var="desired_count=0"

terraform apply -auto-approve \
  -var="enable_alb=false" \
  -var="enable_nat=false"
```

---

## Command Cheat Sheet

```bash
# Get cluster name
terraform output -raw ecs_cluster_name

# Get service name
echo "${TF_VAR_project}-${TF_VAR_env}-api"

# List running tasks
aws ecs list-tasks \
  --cluster "$(terraform output -raw ecs_cluster_name)" \
  --service-name "${TF_VAR_project}-${TF_VAR_env}-api"

# Describe service
aws ecs describe-services \
  --cluster "$(terraform output -raw ecs_cluster_name)" \
  --services "${TF_VAR_project}-${TF_VAR_env}-api"

# View CloudWatch logs
aws logs tail "/ecs/${TF_VAR_project}-${TF_VAR_env}-api" --follow
```