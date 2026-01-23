# Cloud Platform Projects (AWS | Serverless + ECS)

This repository contains two AWS projects demonstrating serverless and container-based architectures.

- **Project A — Serverless SaaS (CDK)**: Cognito-authenticated API with DynamoDB, scheduled processing, and CI/CD.
- **Project B — ECS Production on Fargate (Terraform)**: VPC + ALB + ECS + RDS with safe delivery and observability.

## What to look at first
- **Architecture & links**: `docs/portfolio.md`
- **Operational docs**: `docs/runbooks/` and `docs/incidents/`
- **Engineering standards**: `docs/standards.md`

## Repository Layout
- `cdk/` : Project A infrastructure (AWS CDK, TypeScript)
- `apps/` :
  - `apps/a-api/` : serverless API (Lambda)
  - `apps/a-web/` : minimal UI
  - `apps/b-api/` : container API
  - `apps/b-web/` : minimal UI (used for service validation)
- `infra/` : Project B infrastructure (Terraform)
- `docs/` : diagrams, runbooks, incident reports, evaluation checklist

## Project A — Serverless SaaS (CDK)
Stack: Cognito, API Gateway, Lambda, DynamoDB, EventBridge, (optional) SES, S3/CloudFront

API:
- `POST /items`
- `GET /items`
- `GET /summary`

Auth:
- Cognito issues JWT
- API Gateway validates JWT (Cognito Authorizer)
- Lambdas derive `userId` from JWT claims (e.g., `sub`)

Data (DynamoDB):
- PK: `USER#{userId}`
- SK: `ITEM#{itemId}`

## Project B — ECS Production on Fargate (Terraform)
Stack: VPC (public/private), ALB, ECS Fargate, ECR, RDS PostgreSQL, Secrets Manager, CloudWatch

## How to Run (Quick)
Project A:
- `cd cdk && npm install`
- `npx cdk synth`
- `npx cdk deploy -c stage=dev` (optional; CI/CD deploy is primary)

Project B:
- `cd infra/b-terraform`
- `terraform init`
- `terraform plan` / `terraform apply` (dev only)
