# Alarm Runbook: Summary Lambda Errors (project-a dev)

## Alarm
- Name: project-a-dev-summary-errors
- Signal: AWS/Lambda Errors >= 1 within 5 minutes
- Region: ap-southeast-2

## What this means
The Summary Lambda encountered an unhandled exception during execution.

## Where to check
1. CloudWatch Dashboard: project-a-dev-overview
2. CloudWatch Logs:
   - Log group: /aws/lambda/<SummaryFn>
   - Look for the first ERROR/Exception in the latest log stream

## First actions (within 5 minutes)
1. Confirm the alarm is not caused by a scheduled verification or test.
2. Open the latest error log and identify the exception message.
3. Check recent deployments and environment variable changes.

## Common causes
- Unexpected runtime exception in summary logic
- Missing or invalid environment variables
- SES send failure
- DynamoDB query error

## Recovery
- Fix code or configuration and redeploy via CI (deploy-dev).
- If needed, rollback to the previous known-good commit.

## Verification
This alarm was manually verified by temporarily forcing a controlled failure
in the Summary Lambda and confirming SNS email notification delivery.

## Post-incident
- Add or update tests for the failure pattern.
- Update docs/observability.md if new patterns are discovered.
