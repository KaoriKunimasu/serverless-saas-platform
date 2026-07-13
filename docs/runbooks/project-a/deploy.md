# Project A Deployment Runbook

## Purpose

This runbook describes how to deploy and verify the Project A serverless API.

Project A uses:

- Amazon API Gateway HTTP API
- AWS Lambda
- Amazon Cognito JWT authorisation
- Amazon DynamoDB
- Amazon EventBridge
- AWS CDK
- GitHub Actions with OIDC-based AWS authentication

## Prerequisites

Before deploying:

- Confirm that the relevant pull request has passed CI checks.
- Confirm that application tests pass.
- Confirm that CDK synthesis succeeds.
- Confirm that AWS deployment credentials are provided through the approved OIDC workflow.
- Confirm the target environment and stage.

## Local Validation

Run application build and tests:

```bash
cd apps/a-api
npm ci
npm run build
npm test
```

Run CDK build, tests, and synthesis:

```bash
cd ../../cdk
npm ci
npm run build
npm test
npx cdk synth -c stage=dev
```

## Deployment

The normal development deployment path is GitHub Actions after changes are merged to `main`.

For an approved local deployment to the development environment:

```bash
cd cdk
npx cdk deploy CdkStack -c stage=dev --require-approval never
```

Do not use local deployment credentials unless the deployment method is approved for the environment.

## Post-Deployment Verification

### Verify the health endpoint

Retrieve the deployed HTTP API URL from CloudFormation:

```bash
aws cloudformation describe-stacks \
  --stack-name CdkStack \
  --query "Stacks[0].Outputs[?OutputKey=='HttpApiUrl'].OutputValue" \
  --output text
```

Call the public health endpoint:

```bash
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/health
```

Expected HTTP response:

```text
HTTP/2 200
Content-Type: application/json
```

Expected response body:

```json
{
  "service": "project-a-api",
  "status": "ok",
  "stage": "dev",
  "timestamp": "<ISO-8601 timestamp>"
}
```

The health response must not include:

- Credentials
- JWTs
- Customer data
- User identifiers
- DynamoDB records
- Secrets
- Full environment configuration values
- AWS account information

### Verify protected API routes remain protected

Confirm that an unauthenticated request to a protected route is rejected:

```bash
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/items
```

Expected result:

```text
HTTP/2 401
```

The public `/health` endpoint must return `200`, while `/items` and `/summary` must continue to require Cognito JWT authentication.

### Verify deployment logs

If the health check does not return HTTP `200`:

1. Record the approximate timestamp and timezone.
2. Record the endpoint, HTTP method, expected result, and actual result.
3. Capture the API Gateway request ID if available.
4. Review the Health Lambda CloudWatch Logs.
5. Confirm that the `GET /health` API Gateway route exists.
6. Confirm that the Health Lambda handler is configured correctly.
7. Confirm that the latest GitHub Actions deployment completed successfully.
8. Escalate with sanitised logs and reproducible evidence.

## Successful Deployment Criteria

A deployment is considered successful when:

- Application build succeeds.
- Application tests succeed.
- CDK build and tests succeed.
- CDK synthesis succeeds.
- GitHub Actions deployment succeeds.
- `GET /health` returns HTTP `200`.
- The health response has the expected JSON shape.
- Protected application routes continue to require authentication.
