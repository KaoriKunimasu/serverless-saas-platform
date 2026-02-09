# Runbook: Autoscaling Verification (Project B)

## Trigger load
PowerShell:
1..200 | % { iwr "http://<ALB>/burn?ms=1500" -UseBasicParsing }

## Observe scaling
aws ecs describe-services \
  --cluster project-b-dev-cluster \
  --services project-b-dev-api \
  --query "services[0].desiredCount"

Expected:
1 → 2 → 3

## Scale-in
Wait 5–10 minutes
Expected:
3 → 1
