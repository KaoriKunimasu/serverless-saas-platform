# Project A API Troubleshooting Playbook

## Purpose

This playbook provides a repeatable process for investigating support issues affecting the Project A serverless API.

It is designed for issues involving:

- API availability
- HTTP request and response behaviour
- Cognito JWT authentication
- Request validation
- Lambda execution
- DynamoDB write failures
- Health-endpoint verification
- Post-deployment checks

Procedures are designed to demonstrate reproducible investigation, safe handling of customer information, structured logging, and complete engineering escalation context.

## System Request Flow

### Protected item-creation request

```text
Client
  → API Gateway HTTP API
  → Cognito JWT authoriser
  → CreateItem Lambda
  → DynamoDB
  → HTTP response
```

### Public health check

```text
Client or deployment workflow
  → API Gateway HTTP API
  → Health Lambda
  → HTTP response
```

The `/health` endpoint does not require JWT authentication and is used for basic post-deployment availability verification.

## Known Endpoints

| Method | Path | Authentication | Purpose |
|---|---|---:|---|
| `GET` | `/health` | No | Basic API availability verification |
| `POST` | `/items` | Yes | Create an item for the authenticated user |
| `GET` | `/items` | Yes | List items for the authenticated user |
| `GET` | `/summary` | Yes | Retrieve a user summary |

## Health Endpoint Behaviour

### Request

```text
GET /health
```

### Expected response

```text
HTTP 200
Content-Type: application/json
```

```json
{
  "service": "project-a-api",
  "status": "ok",
  "stage": "dev",
  "timestamp": "<ISO-8601 timestamp>"
}
```

The health response must not expose:

- Credentials
- JWTs
- Customer data
- User identifiers
- DynamoDB records
- Secret values
- Full environment configuration
- AWS account information

## Create Item Request Behaviour

### Request

```text
POST /items
Authorization: Bearer <Cognito JWT>
Content-Type: application/json
```

### Valid request body

```json
{
  "name": "Lunch",
  "amount": 12.5
}
```

### Validation requirements

| Field | Requirement |
|---|---|
| `name` | Non-empty string |
| `amount` | Positive number greater than zero |

### Expected successful response

```text
HTTP 200
```

The response includes an item identifier, an authenticated-user partition key, the submitted item values, and a creation timestamp.

## Information to Collect Before Investigation

Before beginning technical investigation, collect only the information needed to reproduce and scope the issue.

```text
Reporter or customer:
Environment:
Approximate timestamp and timezone:
Affected endpoint:
HTTP method:
Expected behaviour:
Actual behaviour:
HTTP status code:
API Gateway request ID, if available:
Reproduction steps:
Frequency:
Scope:
Business or customer impact:
Known workaround:
```

Do not request or store:

- JWTs
- Passwords
- API secrets
- Cookies
- Raw Authorisation headers
- Full request bodies containing sensitive information
- Unredacted customer identifiers

## Expected Versus Actual Behaviour

Record the issue in a concise format.

```text
Expected:
A valid authenticated POST /items request creates an item and returns HTTP 200.

Actual:
The request returned HTTP 500.

Reproduction:
1. Sign in through the configured Cognito flow.
2. Submit a valid JSON request to POST /items.
3. Record the timestamp, endpoint, HTTP status, and request ID.
4. Review sanitised Lambda logs for the matching request ID.
```

A useful problem statement includes:

- What the user attempted
- What the user expected
- What occurred instead
- Whether the problem is reproducible
- Which environment is affected
- Whether the issue is isolated or widespread

## HTTP Status Triage

| Status | Likely meaning | Initial investigation |
|---:|---|---|
| `200` | Request completed successfully | Confirm expected response body and customer outcome |
| `400` | Request body is missing, malformed, or invalid | Check JSON syntax and required field values |
| `401` | Authentication is missing, invalid, or expired | Confirm Cognito JWT handling and API Gateway authorisation |
| `403` | Request is authenticated but not permitted | Review authorisation design and resource access controls |
| `404` | Route or resource was not found | Confirm HTTP method, path, and deployment version |
| `429` | Request throttling | Review request rate and API Gateway throttling configuration |
| `500` | Lambda or dependency failure | Review structured logs, Lambda errors, and DynamoDB access |
| `502` | API Gateway integration issue | Confirm Lambda integration, deployment configuration, and runtime errors |

Not every status is currently generated directly by the application handler. API Gateway, Cognito, or downstream AWS services may return errors before the request reaches Lambda.

## Create Item Error Triage

The `createItem` Lambda records specific structured event names and error reasons.

| API result | Log event | Log reason or category | Investigation focus |
|---:|---|---|---|
| `400` | `createItem.requestRejected` | `missing_body` | Confirm request body is present |
| `400` | `createItem.requestRejected` | `invalid_json` | Confirm valid JSON syntax |
| `400` | `createItem.requestRejected` | `invalid_input` | Confirm non-empty `name` and positive numeric `amount` |
| `401` | `createItem.requestRejected` | `missing_authenticated_user` | Confirm JWT authoriser context is available to Lambda |
| `500` | `createItem.dynamodbWriteFailed` | `dynamodb_write_failure` | Review DynamoDB permissions, table configuration, and Lambda errors |
| `200` | `createItem.created` | Not applicable | Confirm successful item creation using request ID and item ID |

## Authentication Investigation

Protected routes use an API Gateway HTTP API JWT authoriser configured for Cognito.

### Initial checks

1. Confirm that the affected route is expected to require authentication.
2. Confirm that the request contains a valid Cognito JWT.
3. Confirm that the token has not expired.
4. Confirm that the request uses the correct API URL and route.
5. Confirm that the configured Cognito user pool and client are correct for the environment.
6. Record the HTTP status and request ID where available.

### Important distinction

API Gateway may reject an unauthenticated request before it reaches the Lambda function.

In that case:

- The client may receive HTTP `401`.
- There may be no matching CreateItem Lambda application log.
- Investigation should include API Gateway authoriser configuration and client token handling.

If Lambda receives an event without an authenticated user claim, the CreateItem handler records:

```text
event: createItem.requestRejected
reason: missing_authenticated_user
statusCode: 401
```

## Request Validation Investigation

The CreateItem handler validates request bodies with a schema requiring:

```json
{
  "name": "non-empty string",
  "amount": "positive number"
}
```

### Missing body

Expected response:

```text
HTTP 400
message: Missing body
```

Structured log evidence:

```text
event: createItem.requestRejected
reason: missing_body
statusCode: 400
```

### Invalid JSON

Expected response:

```text
HTTP 400
message: Invalid JSON
```

Structured log evidence:

```text
event: createItem.requestRejected
reason: invalid_json
statusCode: 400
```

### Invalid input

Expected response:

```text
HTTP 400
message: Invalid input
```

Structured log evidence:

```text
event: createItem.requestRejected
reason: invalid_input
statusCode: 400
```

## DynamoDB Failure Investigation

If DynamoDB fails during item creation, the API returns a safe error response.

Expected client response:

```text
HTTP 500
message: Internal server error
```

The client response intentionally does not expose AWS SDK error details, table names, stack traces, or internal configuration.

Structured log evidence:

```text
event: createItem.dynamodbWriteFailed
statusCode: 500
errorCategory: dynamodb_write_failure
errorName: <error name>
requestId: <API Gateway request ID>
```

### Initial investigation steps

1. Find the matching structured log event using the request ID.
2. Confirm the event category is `dynamodb_write_failure`.
3. Review the Lambda error name and relevant CloudWatch service errors.
4. Confirm that the DynamoDB table exists in the expected environment.
5. Confirm that the Lambda execution role has the required DynamoDB permissions.
6. Confirm that the item schema and key structure match the table design.
7. Determine whether the failure is isolated or affects all write requests.
8. Escalate with sanitised evidence if application or infrastructure changes are required.

## Structured Log Investigation

Project A writes structured JSON logs.

Relevant log fields may include:

```text
timestamp
event
requestId
method
path
statusCode
reason
errorCategory
errorName
itemId
```

### Primary event names

```text
createItem.requestReceived
createItem.requestRejected
createItem.dynamodbWriteFailed
createItem.created
health.checkSucceeded
```

### Sensitive-data handling

The logging utility redacts values associated with sensitive keys, including:

```text
authorization
token
password
secret
cookie
body
email
userId
username
```

Do not include unredacted request bodies, JWTs, customer emails, cookies, secrets, or user identifiers in support notes, pull requests, issue comments, or engineering escalations.

### CloudWatch Logs investigation workflow

1. Identify the relevant Lambda function and log group in the AWS console.
2. Search around the reported timestamp.
3. Filter using the API Gateway request ID where available.
4. Identify the structured `event` field.
5. Compare `statusCode`, `reason`, and `errorCategory` with the expected request behaviour.
6. Record only sanitised log evidence.
7. Link the evidence to the support case or engineering escalation.

Example CloudWatch Logs Insights query:

```sql
fields @timestamp, event, requestId, method, path, statusCode, reason, errorCategory, errorName, itemId
| filter requestId = "replace-with-request-id"
| sort @timestamp asc
```

## Post-Deployment Investigation

The deployment workflow performs a health smoke test after CDK deployment.

The workflow:

1. Retrieves `HttpApiUrl` from CloudFormation stack outputs.
2. Calls `GET /health`.
3. Retries transient HTTP failures.
4. Requires an HTTP success response.
5. Validates that the JSON response contains:

```json
{
  "service": "project-a-api",
  "status": "ok",
  "stage": "dev"
}
```

If the deployment workflow fails at the health-verification step:

1. Record the GitHub Actions run URL.
2. Record the deployment commit SHA.
3. Confirm whether CDK deployment itself completed.
4. Confirm that CloudFormation returned the expected `HttpApiUrl`.
5. Confirm that `GET /health` is present in API Gateway.
6. Review Health Lambda logs.
7. Confirm the expected stage is returned.
8. Determine whether rollback is required using the Project A rollback runbook.

## Engineering Escalation Package

Escalate to engineering when:

- The issue is reproducible and requires an application or infrastructure change.
- The issue affects multiple users or critical workflow functionality.
- The issue cannot be resolved through documented configuration or support guidance.
- A dependency failure, security issue, or data-integrity concern is identified.
- A rollback decision is required.

Include the following information:

```text
Summary:
Environment:
Severity and impact:
Affected endpoint:
HTTP method:
Expected behaviour:
Actual behaviour:
HTTP status:
Approximate timestamp and timezone:
API Gateway request ID:
Reproduction steps:
Frequency and scope:
Sanitised request and response details:
Relevant structured log events:
Initial investigation:
Known workaround:
Requested engineering action:
```

## Customer Communication Guidance

### Initial acknowledgement

```text
Thank you for reporting this issue. We are investigating the behaviour and will provide an update once we have confirmed the scope and next steps.
```

### Investigation update

```text
We have reproduced the reported behaviour and are reviewing the relevant application and service logs. At this stage, the issue appears to affect <scope>. We will provide the next update by <time and timezone>.
```

### Resolution update

```text
The issue has been resolved. We verified the expected behaviour by <brief verification summary>. Please let us know if you continue to experience any unexpected behaviour.
```

Do not expose internal architecture details, credentials, customer data, internal error messages, or unredacted logs in customer-facing communication.

## Closure Checklist

Before closing a support case:

- [ ] Expected and actual behaviour are documented.
- [ ] Reproduction steps are documented or the issue is recorded as non-reproducible.
- [ ] Environment, timestamp, endpoint, and HTTP method are recorded.
- [ ] Relevant request ID and sanitised log evidence are recorded.
- [ ] The issue is resolved, mitigated, escalated, or documented with a known workaround.
- [ ] The customer has received an appropriate update.
- [ ] A knowledge-base, runbook, test, or incident record was updated where needed.
- [ ] No credentials, JWTs, secrets, or personal data were added to support records.
