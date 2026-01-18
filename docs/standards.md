## Cost Guardrails
- Monthly AWS budget: USD 10 (alert at 85% / 100%)
- Budgets used for early warning, not auto-shutdown

## Environments
- dev: cost-optimized, limited safeguards
- prod: full alarms, backups, stricter IAM

## CI/CD
- GitHub Actions used for build/test
- AWS access via GitHub OIDC (no long-lived credentials)

## Infrastructure as Code
- CDK for serverless stacks
- Terraform planned for container-based workloads

## Logging
- Structured JSON logs
- CloudWatch Logs retention defined per environment