# Project B API - Deployment Runbook

## Purpose

Deploy a new API image to ECS using GitHub Actions and verify the service with minimum running cost.

---

## Operating Modes

### Normal (Cost-Saving Default)

Infrastructure is stopped to minimize costs:

```hcl
enable_nat     = false
enable_alb     = false
desired_count  = 0
```

**Note:** ALB does not exist → `curl` will fail.

### Demo / Verification Mode

Temporarily start infrastructure, test, then stop immediately.

---

## Deployment Workflow

### 1. Start Infrastructure (For Demo / Verification)

```bash
terraform apply \
  -var="enable_nat=true" \
  -var="enable_alb=true" \
  -var="desired_count=1"
```

**Wait until:**
- ECS service → `RUNNING` tasks = 1
- Target group = `healthy`

---

### 2. Deploy

**Trigger:**
- Push changes to `main` or `project-b/*` branch

**Process:**
- GitHub Actions → "Project B - deploy dev (api)" runs automatically
- Wait until ECS service becomes stable

---

### 3. Verification

```bash
# Get ALB DNS name
alb=$(terraform output -raw alb_dns_name)

# Health check
curl "http://$alb/health"

# Database check
curl "http://$alb/db-check"
```

**Expected Response:**
```
200 {"status":"ok"}
```

---

### 4. Stop Infrastructure (Immediately After Demo)

```bash
# Stop ECS tasks
terraform apply -var="desired_count=0"

# Remove ALB and NAT
terraform apply \
  -var="enable_alb=false" \
  -var="enable_nat=false"
```

**This removes:**
- ECS tasks
- ALB
- NAT Gateway

**Result:** Cost returns close to $0

---

## Troubleshooting

### If You Receive 503 Error

Check the following:

1. **ECS tasks running?**
   ```bash
   aws ecs list-tasks --cluster <cluster-name> --service-name <service-name>
   ```

2. **Target group healthy?**
   ```bash
   aws elbv2 describe-target-health --target-group-arn <target-group-arn>
   ```

3. **Deployment still starting?**
   - Check if within grace period
   - Review ECS service events

### Debug Resources

- **GitHub Actions logs**: Check workflow execution details
- **ECS service events**: Review deployment timeline and errors
- **CloudWatch logs**: Check application logs for runtime errors

---

## Quick Reference

```bash
# Start infrastructure
terraform apply -var="enable_nat=true" -var="enable_alb=true" -var="desired_count=1"

# Get ALB DNS
alb=$(terraform output -raw alb_dns_name)

# Test endpoints
curl "http://$alb/health"
curl "http://$alb/db-check"

# Stop infrastructure
terraform apply -var="desired_count=0"
terraform apply -var="enable_alb=false" -var="enable_nat=false"
```