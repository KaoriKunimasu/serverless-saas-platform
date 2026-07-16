# System Overview

This repository holds two AWS projects built around different architectures: one serverless, one containerised.

The application logic in both is deliberately thin. What's being worked out here is the infrastructure around it — security boundaries, deployment workflow, and what it takes to operate each one.

---

## Repository Scope

- **Project A** — serverless, leaning on managed services wherever they'll do the job.
- **Project B** — containerised, where the networking and scaling have to be configured by hand.

Both follow the same ground rules: infrastructure defined in code, security configuration written out rather than left to defaults, and enough logging and runbooks to debug them without guessing.

---

## Project A — Serverless SaaS (AWS CDK)

### Purpose

A small serverless backend assembled almost entirely from managed AWS services. It covers authentication, a handful of API routes, per-user data isolation, and one scheduled job, with no custom infrastructure holding it together.

### Architecture

- **Authentication**: Amazon Cognito User Pool
- **API Layer**: API Gateway (HTTP API)
- **Compute**: AWS Lambda (Node.js / TypeScript)
- **Data Store**: Amazon DynamoDB (on-demand billing)
- **Background Processing**: Amazon EventBridge (scheduled execution)
- **Infrastructure Definition**: AWS CDK (TypeScript)

Each Lambda covers a single endpoint and takes the caller's identity from the JWT claims that the API Gateway authorizer attaches to the request.

### Design Notes

- Token validation happens at the API Gateway authorizer, so no handler parses a JWT itself.
- DynamoDB is partitioned by user ID, so one caller's query can't reach another's items.
- The `stage` context flag drives the differences between environments (removal policy, point-in-time recovery, schedule cadence) rather than a second copy of the stack.

---

## Project B — ECS on Fargate (Terraform)

### Purpose

A container deployment where the VPC, orchestration, and scaling rules are all spelled out. The service itself only does three things — health, a database connectivity check, and a CPU-burn endpoint used for the autoscaling test — because the point is the infrastructure it runs on.

### Architecture

- **Networking**: VPC with public and private subnets
- **Load Balancing**: Application Load Balancer
- **Compute**: ECS Fargate
- **Container Registry**: Amazon ECR
- **Database**: Amazon RDS (PostgreSQL)
- **Secrets Management**: AWS Secrets Manager
- **Infrastructure Definition**: Terraform

### Design Notes

- The service and the database sit in private subnets. Only the ALB is public.
- The ECS task role carries no permissions of its own; the execution role can read only the specific secrets it injects.
- Deploy and rollback steps are written down in `docs/runbooks/project-b/`.

---

## Documentation Structure

- `overview.md` — this document
- `standards.md` — naming, conventions, and design assumptions
- `runbooks/` — operational procedures and recovery steps
- `incidents/` — incident write-ups

---

## Out of Scope

Deliberately not built out:

- Frontend UX
- Business logic beyond what's needed to exercise the infrastructure
- Cost optimisation past basic safeguards
- Multi-region or high-availability configurations
