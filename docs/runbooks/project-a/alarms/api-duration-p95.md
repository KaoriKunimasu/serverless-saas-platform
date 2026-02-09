# Alarm Runbook: API Duration p95 (project-a dev)

## Alarm
- Name: project-a-dev-api-duration-p95
- Signal: AWS/Lambda Duration p95 > 3000 ms within 5 minutes
- Region: ap-southeast-2

## What this means
API requests are still succeeding, but response latency is degrading.
This is an early-warning signal for performance problems.

## Where to check
1. CloudWatch Dashboard: project-a-dev-overview
2. CloudWatch Metrics:
   - Lambda Duration (p95)
   - Invocations and Errors for the same time window
3. CloudWatch Logs:
   - Identify whether latency correlates with specific request patterns

## First actions (within 10 minutes)
1. Verify this is not an expected spike (e.g., first cold start after deploy).
2. Check whether invocations increased sharply.
3. Look at logs for slow segments:
   - long DynamoDB call durations (if logged)
   - repeated retries or timeouts
4. Confirm current Lambda configuration:
   - memory size (higher memory often improves CPU/network)
   - timeout setting

## Common causes
- Cold starts after deploy (temporary)
- Increased load causing resource contention
- DynamoDB latency increase (hot partition / large response)
- Inefficient query patterns or excessive item processing
- Large payloads or expensive JSON transformations

## Mitigation options (choose the least risky first)
1. If it’s a transient cold start pattern:
   - monitor for 10–15 minutes, no action required
2. If consistent degradation:
   - optimize query/processing logic
   - reduce data scanned/returned
3. If urgent:
   - increase Lambda memory (improves CPU/network) and redeploy
4. If regression after deploy:
   - rollback to previous known-good commit

## Post-incident
- Add metrics/logging to capture request size and query duration (if missing)
- Add a performance regression note in PR
- Consider adding an additional duration alarm per function if needed
