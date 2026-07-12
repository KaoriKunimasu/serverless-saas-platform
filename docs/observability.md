# Observability and Support Investigation

## Purpose

This project uses structured application logs to support reproducible investigation of API issues while avoiding unnecessary exposure of sensitive request data.

## Available Investigation Context

The serverless API records structured events for:

- Request receipt
- Input-validation failures
- Missing authenticated-user context
- DynamoDB write failures
- Successful item creation

Where available, log events include:

- API Gateway request ID
- HTTP method
- Request path
- Response status code
- Error category
- Safe operational identifiers, such as item ID

## Sensitive Data Handling

The logger redacts values associated with sensitive keys before writing them to logs.

Examples include:

- `authorization`
- `token`
- `password`
- `secret`
- `cookie`
- `body`
- `email`
- `userId`
- `username`

JWTs, raw request bodies, credentials, and customer identifiers should not be included in troubleshooting notes or shared outside approved support and engineering channels.

## Investigation Workflow

When investigating a reported API issue:

1. Collect the approximate timestamp, timezone, endpoint, HTTP method, expected result, and actual result.
2. Obtain the API Gateway request ID where available.
3. Search the relevant application logs using the request ID.
4. Identify the event category and response status.
5. Determine whether the issue is related to request validation, authentication context, application logic, or a dependency such as DynamoDB.
6. Record sanitised evidence, reproduction steps, and customer impact before escalating to engineering.

## Escalation Information

An engineering escalation should include:

- Concise issue summary
- Scope and customer impact
- Environment and approximate timestamp
- Endpoint and HTTP method
- Expected and actual behaviour
- Request ID
- Sanitised request and response details
- Relevant structured log events
- Reproduction steps
- Known workaround, if any
