# System Overview

This repository contains two independent AWS-based projects, each designed to represent a different
architectural approach commonly used in production cloud systems.

The focus is on infrastructure design, security boundaries, deployment workflows, and operational clarity,
rather than feature completeness or UI polish.

---

## Repository Scope

The repository is intentionally split into two projects:

- **Project A** demonstrates a serverless-first architecture optimized for simplicity, scalability,
  and managed services.
- **Project B** demonstrates a container-based architecture where more operational responsibility
  is explicitly managed.

Both projects share common principles:
- Infrastructure as Code
- Clear separation of concerns
- Minimal but explicit security configuration
- Operational visibility via logs and runbooks

---

## Project A — Serverless SaaS (AWS CDK)

### Purpose

Project A represents a small but realistic serverless backend that relies primarily on managed AWS services.
The goal is to show how authentication, API design, data isolation, and scheduled processing can be implemented
without introducing unnecessary custom infrastructure.

### Architecture

- **Authentication**: Amazon Cognito User Pool
- **API Layer**: API Gateway (HTTP API)
- **Compute**: AWS Lambda (Node.js / TypeScript)
- **Data Store**: Amazon DynamoDB (on-demand billing)
- **Background Processing**: Amazon EventBridge (scheduled execution)
- **Infrastructure Definition**: AWS CDK (TypeScript)

Each Lambda function is scoped to a single responsibility and derives the authenticated user context
from JWT claims provided by the API Gateway authorizer.

### Design Notes

- Authentication and token validation are delegated to managed services.
- DynamoDB access is partitioned by user identifier to ensure data isolation.
- Lambda functions are intentionally kept small and stateless.
- Environment separation (e.g. dev / prod) is handled via configuration rather than duplicated code.

---

## Project B — ECS Production on Fargate (Terraform)

### Purpose

Project B represents a more traditional container-based deployment model where networking,
service orchestration, and scaling decisions are explicitly managed.

This project focuses on infrastructure composition, dependency wiring, and operational safeguards.

### Architecture

- **Networking**: VPC with public and private subnets
- **Load Balancing**: Application Load Balancer
- **Compute**: ECS Fargate
- **Container Registry**: Amazon ECR
- **Database**: Amazon RDS (PostgreSQL)
- **Secrets Management**: AWS Secrets Manager
- **Infrastructure Definition**: Terraform

### Design Notes

- Services are deployed into private subnets with controlled ingress.
- Task roles and security groups follow least-privilege principles.
- Deployment and rollback procedures are documented alongside the infrastructure.
- Observability is treated as a first-class concern rather than an afterthought.

---

## Documentation Structure

Supporting documentation is organized under `docs/`:

- `overview.md` — High-level system and architecture overview (this document)
- `standards.md` — Naming, conventions, and design assumptions
- `runbooks/` — Operational procedures and recovery steps
- `incidents/` — Simulated incident reports and resolutions

This structure mirrors how documentation is commonly organized in production repositories.

---

## Out of Scope

The following are intentionally not emphasized:

- Full-featured frontend UX
- Extensive business logic
- Cost optimization beyond basic safeguards
- Multi-region or high-availability configurations

The goal is clarity of architecture and operations, not completeness.

---
