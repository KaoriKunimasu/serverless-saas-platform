# Cloud Platform (AWS)

Two AWS-based services built to compare different cloud application architectures and delivery approaches.

- **Project A**: Serverless API built with AWS CDK
- **Project B**: Containerised ECS Fargate service built with Terraform

Both projects use GitHub Actions with OIDC-based AWS authentication and avoid long-lived AWS credentials in CI/CD.

---

## Project A — Serverless API

JWT-authenticated serverless API built with AWS Lambda and DynamoDB.

### Stack

- Amazon API Gateway HTTP API
- AWS Lambda with Node.js and TypeScript
- Amazon DynamoDB with on-demand billing
- Amazon Cognito
- Amazon EventBridge
- Amazon S3 and CloudFront
- AWS CDK
- Amazon CloudWatch
- GitHub Actions with OIDC

### Features

- JWT authentication through Cognito
- Per-user DynamoDB data isolation
- JSON request validation
- Structured application logging with sensitive-data redaction
- Request correlation through API Gateway request IDs
- Scheduled processing through EventBridge
- Email notifications through Amazon SES
- CloudWatch alarms and dashboard visibility
- Public `/health` endpoint for availability checks
- Deployment, rollback, and troubleshooting runbooks

### Deployment

Automated via GitHub Actions with OIDC-based AWS authentication.

Flow:

1. Build and test the API, frontend, and CDK application
2. Synthesize the CDK stack
3. Deploy the development environment via CDK
4. Retrieve the deployed API URL from CloudFormation outputs

### Documentation

- [Project A deployment runbook](docs/runbooks/project-a/deploy.md)
- [Project A rollback runbook](docs/runbooks/project-a/rollback.md)
- [API troubleshooting playbook](docs/runbooks/project-a/api-troubleshooting-playbook.md)
- [Customer issue intake template](docs/runbooks/project-a/customer-issue-intake-template.md)
- [Observability and support investigation guide](docs/observability.md)
- [Architecture overview](docs/architecture.md)
- [Incident response exercises](docs/incidents/)

---

## Project B — ECS Fargate Service

Container-based API deployed to Amazon ECS Fargate behind an Application Load Balancer, with PostgreSQL persistence and Terraform-managed infrastructure.

### Stack

- Amazon ECS Fargate
- Application Load Balancer
- Amazon RDS for PostgreSQL
- Amazon ECR
- Amazon VPC with public and private subnets
- AWS Secrets Manager
- Amazon CloudWatch
- Terraform
- GitHub Actions with OIDC

### Features

- Docker-based container deployment
- Rolling deployments with health-check grace periods
- Immutable image tags
- CPU-based autoscaling
- Private service networking with controlled ingress
- Least-privilege task roles and security groups
- CloudWatch alarms
- Post-deployment smoke tests
- Deployment, rollback, autoscaling, and cost-control documentation

### Deployment

Automated on pushes to `main` or Project B deployment branches.

Flow:

1. Build the Docker image
2. Push the image to Amazon ECR
3. Register a new ECS task definition
4. Update the ECS service
5. Wait for service stability
6. Run a post-deployment smoke test

### Documentation

- [Project B deployment runbook](docs/runbooks/project-b/deploy.md)
- [Project B rollback runbook](docs/runbooks/project-b/rollback.md)
- [Autoscaling runbook](docs/runbooks/project-b/autoscaling.md)
- [Autoscaling verification results](docs/autoscaling-verification.md)
- [Cost-control guide](docs/cost-control.md)
- [Architecture overview](docs/architecture.md)

---

## Repository Structure

```text
apps/      # Application code for Project A and Project B
cdk/       # AWS CDK infrastructure for Project A
infra/     # Terraform infrastructure for Project B
docs/      # Architecture, runbooks, observability, and incident documentation
```

---

## Local Development

### Project A

Install dependencies and run the frontend locally:

```bash
cd apps/a-web
npm ci
npm run dev
```

Build and test the serverless API:

```bash
cd apps/a-api
npm ci
npm run build
npm test
```

Build, test, and synthesise the CDK application:

```bash
cd cdk
npm ci
npm run build
npm test
npx cdk synth -c stage=test
```

### Project B

Apply Terraform infrastructure for the development environment:

```bash
cd infra/b-ecs/envs/dev
terraform init
terraform apply
```

---

## Security and Operations Principles

- AWS access from GitHub Actions uses OIDC rather than long-lived credentials.
- Infrastructure is defined and versioned through AWS CDK or Terraform.
- API request validation and JWT authentication are implemented at the application and API layers.
- Structured logs support reproducible troubleshooting while redacting sensitive values.
- Deployment, rollback, customer issue intake, and incident documentation are maintained alongside infrastructure and application code.
- Development resources can be stopped when not in use to reduce cloud costs.
