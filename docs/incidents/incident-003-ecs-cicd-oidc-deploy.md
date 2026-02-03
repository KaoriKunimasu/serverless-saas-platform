# Incident-003: ECS CI/CD deployment failures with OIDC, immutable tags, and PassRole

## Summary

GitHub Actions failed multiple times while deploying a new ECS task definition for Project B.  
The pipeline could build and push images to ECR, but deployment to ECS was blocked by IAM and tagging issues.  
This incident documents the root causes and the final stable solution.

---

## Architecture context
```
GitHub Actions (OIDC)
→ AssumeRole (deploy role)
→ Build Docker image
→ Push to ECR (immutable tags)
→ Register new ECS task definition
→ Update ECS service
```

---

## Symptoms

### 1. OIDC assume role failure
```
Could not assume role with OIDC: Request ARN is invalid
```

### 2. ECR push failure
```
tag invalid: tag already exists (immutable repository)
```

### 3. ECS task definition registration failure
```
is not authorized to perform: iam:PassRole
```

---

## Root causes

### A. Missing id-token permission

OIDC token could not be issued because the workflow lacked:
```yaml
permissions:
  id-token: write
```

### B. Immutable ECR tags

Repository had tag immutability enabled.  
Re-running jobs attempted to overwrite existing tags.  
Using `latest` or static tags caused push failures.

### C. Missing iam:PassRole permissions

ECS task definitions reference TWO roles:

- `taskRoleArn`
- `executionRoleArn`

The deploy role must be able to PassRole BOTH.  
Only one role was initially allowed.

### D. STS session reuse

Re-running failed jobs reused the same STS session.  
New IAM permissions were not reflected until a fresh run was started.

---

## Fixes applied

### 1. Enable OIDC permission
```yaml
permissions:
  id-token: write
  contents: read
```

### 2. Use immutable image tags
```
IMAGE_TAG = <commit-sha>-<run-id>
```

Removed `latest`.

### 3. Add minimal PassRole permissions
```
iam:PassRole
  - project-b-dev-ecs-task
  - project-b-dev-ecs-task-exec
```

### 4. Always trigger fresh runs

Avoid "re-run jobs" after IAM changes.  
Start a new workflow run instead.

---

## Final result

The pipeline now:

- uses OIDC (no long-lived credentials)
- uses immutable images
- updates ECS via new task definition revisions
- deploys automatically on push
- follows least-privilege IAM

Deployment is fully automated and reproducible.

---

## Prevention

- Always grant PassRole for all ECS task roles
- Avoid mutable tags like `latest`
- Prefer new workflow runs after IAM changes
- Keep IAM managed in Terraform

---

## Outcome

Stable CI/CD pipeline for Project B:
```
push → build → push → register → deploy → healthy
```