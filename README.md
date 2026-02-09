# Cloud Platform (AWS)

Two AWS-based services with different architecture approaches.

- **Project A**: Serverless API (CDK)
- **Project B**: ECS Fargate service (Terraform)

Both deployed via GitHub Actions with OIDC.

---

## Project A — Serverless API

JWT-authenticated API built with Lambda and DynamoDB.

### Stack
- API Gateway (HTTP API)
- Lambda (Node.js / TypeScript)
- DynamoDB (on-demand)
- Cognito
- EventBridge
- S3 + CloudFront
- CDK

### Features
- JWT authentication
- Per-user data isolation
- Scheduled processing
- Email notifications
- CloudWatch alarms

### Deployment

Automated via GitHub Actions with OIDC.

Flow:
1. Build Lambda functions
2. Synthesize CDK stack
3. Deploy via CDK
4. Run integration tests

### Documentation

- `docs/runbooks/project-a/` — deploy, troubleshooting procedures
- `docs/architecture.md` — design decisions

---

## Project B — ECS Service

Container-based API on ECS Fargate with ALB and RDS.

### Stack
- ECS Fargate
- Application Load Balancer
- RDS PostgreSQL
- ECR
- Terraform
- GitHub Actions (OIDC)

### Features
- Rolling deployments
- Health checks with grace period
- CPU-based autoscaling
- Immutable image tags
- CloudWatch alarms
- Smoke tests after deploy

### Deployment

Automated on push to main or project-b branches.

Flow:
1. Build Docker image
2. Push to ECR
3. Register new task definition
4. Update ECS service
5. Wait for stability
6. Run smoke test

### Documentation

- `docs/runbooks/project-b/` — deploy, rollback procedures
- `docs/autoscaling-verification.md` — scaling test results
- `docs/cost-control.md` — stop/start guide
- `docs/architecture.md` — design decisions

---

## Repository Structure
```
apps/      # application code
cdk/       # CDK stacks (Project A)
infra/     # Terraform (Project B)
docs/      # runbooks, incidents, architecture notes
```

---

## Local Development

### Project A
```bash
cd apps/a-web
npm install
npm run dev
```

### Project B
```bash
cd infra/environments/dev
terraform apply
```

---

## Notes

- All AWS access via OIDC (no static credentials)
- Infrastructure managed via IaC
- Dev environment can be stopped when not in use to minimize cost