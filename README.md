# Cloud Platform Projects (AWS | Serverless + ECS)

This repository contains two AWS-based projects showcasing different production architectures:
serverless and container-based.

- **Project A — Serverless SaaS (CDK)**  
  Cognito-authenticated HTTP API built with AWS Lambda and DynamoDB, including scheduled processing and CI/CD.

- **Project B — ECS Production on Fargate (Terraform)**  
  Container-based application running on ECS Fargate with ALB, RDS, and infrastructure managed via Terraform.

## Where to start
- **System overview & architecture**: `docs/overview.md`
- **Operational documentation**: `docs/runbooks/`, `docs/incidents/`
- **Engineering standards & conventions**: `docs/standards.md`

## Repository layout
- `cdk/` — Infrastructure for Project A (AWS CDK, TypeScript)
- `apps/`
  - `apps/a-api/` — Serverless API (Lambda)
  - `apps/a-web/` — Minimal frontend
  - `apps/b-api/` — Container-based API
  - `apps/b-web/` — Minimal frontend for validation
- `infra/` — Infrastructure for Project B (Terraform)
- `docs/` — Architecture notes, runbooks, incidents, and supporting documentation
