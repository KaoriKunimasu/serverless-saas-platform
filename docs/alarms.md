# CloudWatch Alarm Baseline (Draft)

## API / Lambda
- Lambda Errors > 0 
- Lambda Throttles > 0
- Duration p95 exceeds expected threshold

## API Gateway
- 5XX Error > 0
- Latency p95 exceeds threshold

## DynamoDB
- ThrottledRequests > 0
- SystemErrors > 0

## Notifications
- Alarms routed to SNS (email)
- Severity-based thresholds (planned)

## Notes
- Alarms will be enabled in prod only
- Dev environment uses logs and metrics for inspection