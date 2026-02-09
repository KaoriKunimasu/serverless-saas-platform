# Alarm Runbook: CreateItem Lambda Errors (project-a dev)

## Alarm
- Name: project-a-dev-createItem-errors
- Signal: AWS/Lambda Errors >= 1 within 5 minutes
- Region: ap-southeast-2

## What this means
The CreateItem Lambda encountered an unhandled exception (typically 5xx)
while handling `POST /items`.

## Where to check
1. CloudWatch Dashboard: project-a-dev-overview
2. CloudWatch Logs:
   - Log group: /aws/lambda/<CreateItemFn>
   - Inspect the latest log stream for ERROR/Exception

## First actions (within 5 minutes)
1. Confirm the spike is not caused by a load test or replay.
2. Open the most recent error log and capture:
   - request id
   - route and payload shape (do not paste secrets)
   - exception message and stack trace
3. Check for deployment correlation:
   - Was there a deploy within the last 30 minutes?

## Common causes
- Input validation bug leading to throw
- Missing environment variable (e.g., table name)
- DynamoDB errors:
  - AccessDenied
  - ValidationException
  - ProvisionedThroughputExceeded (unlikely with on-demand, but possible throttling)
- Serialization/JSON parsing errors

## Recovery
- Fix code/config and redeploy via CI (deploy-dev).
- If urgent and a regression is confirmed:
  - rollback to the previous known-good commit

## Post-incident
- Add/extend a unit test for the failing payload pattern
- Add a regression test around the discovered edge case
- Update docs/observability.md if a new operational pattern emerges
