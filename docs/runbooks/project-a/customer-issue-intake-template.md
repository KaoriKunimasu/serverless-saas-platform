# Project A Customer Issue Intake Template

## Purpose

Use this template to collect enough information to investigate a Project A API issue without requesting or storing unnecessary sensitive information.

Use the completed internal section as the starting point for reproduction, log investigation, and engineering escalation.

---

## Customer-Facing Acknowledgement

```text
Thank you for reporting this issue. We are investigating the behaviour and will provide an update once we have confirmed the scope and next steps.

To help us investigate, please share the approximate time of the issue, the affected workflow or endpoint if known, the expected result, the actual result, and any visible error message or screenshot with sensitive information removed.
```

---

## Customer Information to Request

```text
Approximate issue time and timezone:
Affected workflow or endpoint:
Steps taken before the issue:
Expected result:
Actual result:
Visible error message:
Screenshot or screen recording, with sensitive information removed:
Whether the issue is reproducible:
How frequently the issue occurs:
Business or workflow impact:
```

Do not request:

```text
Passwords
JWTs
Authorisation headers
API keys
Cookies
Secrets
Raw customer data
Unredacted request bodies
```

---

## Internal Case Record

```text
Case ID:
Case owner:
Date opened:
Environment:
Reporter or customer:
Severity:
Business impact:
Affected users:
Issue frequency:
Current status:
Next customer update due:
```

---

## Technical Context

```text
Affected endpoint:
HTTP method:
Expected HTTP status:
Actual HTTP status:
Approximate timestamp and timezone:
API Gateway request ID:
Deployment commit SHA:
GitHub Actions run URL, if relevant:
```

Known Project A endpoints:

```text
GET /health
POST /items
GET /items
GET /summary
```

---

## Expected Versus Actual Behaviour

```text
Expected behaviour:

Actual behaviour:

Reproduction steps:

Reproduction result:

Known workaround:
```

---

## Initial Triage

### Health or availability issue

```text
[ ] Confirm GET /health response
[ ] Confirm HTTP 200 response
[ ] Confirm service = project-a-api
[ ] Confirm status = ok
[ ] Confirm expected environment stage
[ ] Check the latest GitHub Actions deployment result
[ ] Check Health Lambda logs
```

### Authentication issue

```text
[ ] Confirm the endpoint requires authentication
[ ] Confirm the client uses a valid Cognito JWT
[ ] Confirm the token is not expired
[ ] Confirm the request uses the correct API URL
[ ] Record the HTTP status
[ ] Determine whether API Gateway rejected the request before Lambda execution
```

### Input-validation issue

```text
[ ] Confirm request body is present
[ ] Confirm JSON syntax is valid
[ ] Confirm name is a non-empty string
[ ] Confirm amount is a positive number
[ ] Record the HTTP status and safe error message
```

### DynamoDB or internal-error issue

```text
[ ] Record the HTTP status
[ ] Record the API Gateway request ID
[ ] Review structured CreateItem Lambda logs
[ ] Check for event = createItem.dynamodbWriteFailed
[ ] Check for errorCategory = dynamodb_write_failure
[ ] Confirm table and Lambda permissions for the relevant environment
[ ] Determine scope and frequency
```

---

## Structured Log Evidence

```text
Log group:
Request ID:
Relevant event:
Status code:
Reason:
Error category:
Error name:
Timestamp:
Sanitised log excerpt:
```

Expected event names include:

```text
createItem.requestReceived
createItem.requestRejected
createItem.dynamodbWriteFailed
createItem.created
health.checkSucceeded
```

Do not copy unredacted customer data, JWTs, authorisation headers, secrets, tokens, cookies, emails, or user identifiers into this record.

---

## Engineering Escalation

```text
Escalation required: Yes / No

Reason for escalation:

Summary:

Environment:

Severity and customer impact:

Affected endpoint and HTTP method:

Expected behaviour:

Actual behaviour:

HTTP status:

Approximate timestamp and timezone:

API Gateway request ID:

Reproduction steps:

Frequency and scope:

Sanitised request and response evidence:

Relevant structured log events:

Initial investigation completed:

Known workaround:

Requested engineering action:
```

---

## Customer Update

```text
Customer update sent at:

Summary provided:

Current status:

Next update due:
```

Suggested update:

```text
We have completed the initial investigation and are continuing to review the relevant technical evidence. The current impact appears to be <scope>. We will provide the next update by <time and timezone>.
```

---

## Resolution and Closure

```text
Resolution:

Verification performed:

Customer confirmation received:

Follow-up work required:

Knowledge-base or runbook update required:

Test coverage update required:

Incident record required:

Case closed by:

Case closed date:
```

Closure checklist:

```text
[ ] Issue outcome is documented
[ ] Customer received a final update
[ ] Relevant log evidence is sanitised
[ ] Sensitive values were not retained
[ ] Workaround or resolution is recorded
[ ] Engineering follow-up is tracked, if required
[ ] Relevant documentation, tests, or runbooks were updated
```
