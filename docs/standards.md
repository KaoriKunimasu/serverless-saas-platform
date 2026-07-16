# Engineering Standards

Baseline for security, delivery, and operations in this repository. Where
something isn't met, it's marked rather than left to read as if it were.

## Environments

`dev` is the only stage that gets deployed. Project B is torn down between
validation rounds to keep the bill near zero (`docs/cost-control.md`).

Project A's CDK branches on a `stage` context flag: `prod` turns on
point-in-time recovery, switches removal policies to RETAIN, and moves the
summary job from every five minutes to daily. None of it has been deployed.
Standing `prod` up in this account would need the stack name to include the
stage first — `bin/cdk.ts` hardcodes `CdkStack`, so `-c stage=prod` would take
over the existing dev stack instead of creating a second one.

Project B has no `prod` at all. `infra/b-ecs/envs/` contains only `dev`.

Conventions:
- resource names include the stage (`Items-dev`, `project-b-dev-api`)
- resources are tagged `project`, `stage`, `owner` — CDK app-level tags for
  Project A, provider `default_tags` for Project B. The Terraform roots that
  bootstrap the CI role and the state bucket are not tagged.

## CI/CD

Every PR runs:
- install, lint, build
- unit tests — Project A only; `apps/b-api` has none
- `cdk synth`
- `terraform fmt -check` and `terraform validate`

Main branch:
- deploys `dev`
- uses GitHub OIDC, no static credentials
- rollback steps are documented per project

Neither deploy workflow verifies what it deployed. Project A's ends at
`cdk deploy`. Post-deploy health checks are manual, per the deployment
runbooks.

## IAM & Secrets

Principles:
- least privilege
- separate roles for CI/CD, runtime, and human access
- no long-lived access keys for CI/CD

CI/CD:
- GitHub Actions assumes an IAM role via OIDC
- trust policy restricted by repo/branch and audience `sts.amazonaws.com`

Secrets:
- never stored in repo
- Secrets Manager or SSM Parameter Store
- never logged

## Data Protection

DynamoDB (Project A):
- PITR enabled in prod
- stage-specific removal policy (dev may destroy; prod retain/protect)

RDS (Project B):
- encryption at rest
- backups enabled
- credentials stored in Secrets Manager

## Logging & Observability

Logging:
- structured JSON logs with sensitive keys redacted — Project A only;
  `apps/b-api` writes plain `console.log`
- retention is a fixed 30 days (Project A) and 14 days (Project B), not
  stage-specific

Alarms in place:
- Project A: per-Lambda errors, API Gateway p95 duration
- Project B: ALB 5xx, ECS CPU, RDS CPU

Not covered yet: API Gateway 5xx, ALB latency, ECS task restarts, RDS storage.

Runbooks:
- short recovery steps live in `docs/runbooks/`

## Incident Documentation

Incident write-ups follow this format:
- summary
- detection
- root cause
- recovery
- prevention

Location: `docs/incidents/`
