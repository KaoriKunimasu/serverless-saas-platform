# Architecture – Project B

## Overview

Production-style ECS Fargate web application with CI/CD and autoscaling.

## Stack

- Terraform (IaC)
- ECS Fargate
- Application Load Balancer
- PostgreSQL (RDS)
- Secrets Manager
- CloudWatch Logs / Alarms
- GitHub Actions (OIDC)
- Docker / ECR

## Flow

User → ALB → ECS API → RDS

CI/CD:
GitHub → OIDC → ECR → ECS Deploy

## Key Design Decisions

### Why ECS Fargate?
- No servers to manage
- Scales automatically
- Real-world production setup

### Why ALB?
- health checks
- rolling deployments
- production traffic routing

### Why OIDC?
- no long-lived AWS credentials
- secure CI/CD

### Why autoscaling?
- cost efficiency
- resilience under load

## Reliability Features

- health check grace period
- circuit breaker rollback
- smoke test before deploy success
- autoscaling policies