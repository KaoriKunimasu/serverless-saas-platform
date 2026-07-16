# Runbook: Autoscaling Verification (Project B)

## Trigger load
`/burn` needs the shared token the container runs with. Fetch it first:

```powershell
$token = aws secretsmanager get-secret-value --secret-id "project-b-dev/burn/token" --query SecretString --output text
```

PowerShell:
1..200 | % { iwr "http://<ALB>/burn?ms=1500" -Headers @{ Authorization = "Bearer $token" } -UseBasicParsing }

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
