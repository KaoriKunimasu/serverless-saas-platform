# Alarm Runbook: ListItems Lambda Errors (project-a dev)

## Alarm
- Name: project-a-dev-listItems-errors
- Signal: AWS/Lambda Errors >= 1 within 5 minutes
- Region: ap-southeast-2

## What this means
The ListItems Lambda encountered an unhandled exception (typically 5xx)
while handling `GET /items`.

## Where to check
1. CloudWatch Dashboard: project-a-dev-overview
2. CloudWatch Logs:
   - Log group: /aws/lambda/<ListItemsFn>
   - Inspect the latest log stream for ERROR/Exception

## First actions (within 5 minutes)
1. Confirm the alarm is not triggered by an intentional test.
2. Open the latest error log and identify:
   - request id
   - user identity source (Cognito claims / derived userId)
   - exception message and stack trace
3. Check for recent changes:
   - deploy within last 30 minutes
   - environment variable modifications

## Common causes
- DynamoDB query failure:
  - AccessDenied
  - ValidationException (key condition, table name mismatch)
- Unexpected item shape causing runtime errors
- Pagination/limit edge case (if implemented later)
- JSON serialization errors

## Recovery
- Fix code/config and redeploy via CI (deploy-dev).
- If regression is confirmed:
  - rollback to previous known-good commit

## Post-incident
- Add/extend unit tests for the query and item-mapping logic
- Document the failure mode and fix in commit/PR notes
- Update docs/observability.md if the playbook changes
