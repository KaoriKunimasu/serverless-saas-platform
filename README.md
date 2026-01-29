# Cloud Platform Projects (AWS | Serverless + ECS)

This repository contains two AWS-based projects showcasing different production architectures:
serverless and container-based.

- **Project A — Serverless SaaS (CDK)**  
  Cognito-authenticated HTTP API built with AWS Lambda and DynamoDB, including scheduled processing and CI/CD.
- **Project B — ECS Production on Fargate (Terraform)**  
  Container-based application running on ECS Fargate with ALB, RDS, and infrastructure managed via Terraform.

---

## Where to start

- **System overview & architecture**: `docs/overview.md`
- **Operational documentation**: `docs/runbooks/`, `docs/incidents/`
- **Engineering standards & conventions**: `docs/standards.md`

---

## Repository layout

- `cdk/` — Infrastructure for Project A (AWS CDK, TypeScript)
- `apps/`
  - `apps/a-api/` — Serverless API (Lambda)
  - `apps/a-web/` — Minimal frontend
  - `apps/b-api/` — Container-based API
  - `apps/b-web/` — Minimal frontend for validation
- `infra/` — Infrastructure for Project B (Terraform)
- `docs/` — Architecture notes, runbooks, incidents, and supporting documentation

---

## API Testing (Postman)

A Postman collection is provided to verify the authenticated API flow.

- Cognito authentication via `InitiateAuth`
- Access token automatically stored at the collection level
- Protected endpoints inherit Bearer authentication
- Diagnostics request included to confirm unauthorized access is blocked

**Typical flow:**

1. Authenticate via Cognito
2. Create items (`POST /items`)
3. Retrieve aggregates (`GET /summary`)

---

## Screenshots

### Items (Create & List)

![Items](docs/screenshots/items.png)

### Summary (Aggregated view)

![Summary](docs/screenshots/summary.png)

---

## How to run

### API (Project A)

The API is deployed using AWS CDK and exposed via Amazon API Gateway (HTTP API).  
Authentication is handled by Amazon Cognito using JWTs.

**Main endpoints:**

- `POST /items` — create an item (authenticated)
- `GET /items` — list user items (authenticated)
- `GET /summary` — aggregated summary per user (authenticated)

---

### Frontend (Next.js)
```bash
cd apps/a-web
npm install
npm run dev
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://<api-id>.execute-api.<region>.amazonaws.com
```

Then open:
```
http://localhost:3000
```

---

## Architecture (Project A)

- **API**: Amazon API Gateway (HTTP API)
- **Compute**: AWS Lambda (Node.js / TypeScript)
- **Auth**: Amazon Cognito User Pool (JWT)
- **Database**: Amazon DynamoDB (on-demand)
- **Scheduler**: Amazon EventBridge
- **IaC**: AWS CDK (TypeScript)
- **Frontend**: Next.js

---

## Cost notes

This project is designed to keep development costs low:

- DynamoDB uses on-demand billing
- Lambda functions are event-driven
- Non-production environments use DESTROY removal policies
- Production environments are intended to apply retention policies, alarms, and stricter controls.