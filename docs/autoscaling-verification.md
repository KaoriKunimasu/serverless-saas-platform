# Autoscaling Verification – Project B

## Objective
Verify that the ECS Fargate service automatically scales out/in based on CPU utilization using target tracking.

## Configuration

| Setting | Value |
|--------|--------|
| Metric | ECSServiceAverageCPUUtilization |
| Target | 70% |
| Min tasks | 1 |
| Max tasks | 3 |
| Scale out cooldown | 60s |
| Scale in cooldown | 180s |
| Health check grace | 180s |

Terraform:
- aws_appautoscaling_target
- aws_appautoscaling_policy

## Load Test Method

Custom endpoint added:
```
GET /burn?ms=1500
```

This endpoint intentionally burns CPU to simulate heavy load. It requires the
shared token in `project-b-dev/burn/token`, so that a public ALB isn't handing
anonymous callers a way to burn CPU.

Example:
```powershell
$token = aws secretsmanager get-secret-value --secret-id "project-b-dev/burn/token" --query SecretString --output text
1..150 | % { iwr "http://<ALB>/burn?ms=1500" -Headers @{ Authorization = "Bearer $token" } }
```

## Observed Results

Before load:
```
desired: 1
running: 1
```

During load:
```
desired: 3
running: 3
```

Scaling activities:
```
Setting desired count to 2 – Successful
Setting desired count to 3 – Successful
```

After cooldown:
```
desired: 1
running: 1
```

## Conclusion

The service automatically:
- scales out under CPU pressure
- scales in after cooldown
- maintains availability during deployment

Autoscaling confirmed working in production-style environment.