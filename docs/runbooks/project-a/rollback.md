# Project A Rollback Runbook

## Purpose

This runbook describes how to roll back a Project A serverless API deployment when a release causes an application, routing, authentication, or availability issue.

Project A is deployed through AWS CDK and GitHub Actions.

## When to Roll Back

Consider rollback when one or more of the following occur after deployment:

- The public health endpoint does not return HTTP `200`.
- Protected API routes return unexpected errors.
- API Gateway routes are unavailable or misconfigured.
- Lambda functions fail during invocation.
- Authentication behaviour changes unexpectedly.
- A release introduces a customer-impacting regression.
- A deployment completes but post-deployment verification fails.

## Initial Investigation

Before rolling back, collect the following information:

- Deployment commit SHA
- Pull request URL
- Deployment timestamp and timezone
- Target environment and stage
- Affected endpoint and HTTP method
- Expected behaviour
- Actual behaviour
- HTTP response status
- API Gateway request ID, if available
- Sanitised CloudWatch Logs
- Scope and impact of the issue
- Any available workaround

Do not include JWTs, credentials, request bodies, customer data, user identifiers, or secrets in issue comments or escalation notes.

## Rollback Decision

Use rollback when:

- The issue is confirmed or highly likely to be caused by the latest deployment.
- The impact is greater than the risk of returning to the previous version.
- A safe forward fix cannot be delivered quickly enough.
- The previous known-good revision is available in Git history.

## Standard Rollback Procedure

### 1. Identify the merge commit

Review the GitHub pull request or Git history to identify the merge commit that introduced the issue.

```bash
git log --oneline --decorate -n 20
```

### 2. Create a rollback branch

Start from the current `main` branch:

```bash
git checkout main
git pull --ff-only
git checkout -b revert/<short-description>
```

Example:

```bash
git checkout -b revert/health-endpoint-release
```

### 3. Revert the affected merge commit

For a merged pull request commit:

```bash
git revert -m 1 <merge-commit-sha>
```

For a normal non-merge commit:

```bash
git revert <commit-sha>
```

Resolve conflicts if required, then verify the resulting changes.

### 4. Validate the rollback locally

Run application validation:

```bash
cd apps/a-api
npm ci
npm run build
npm test
```

Run infrastructure validation:

```bash
cd ../../cdk
npm ci
npm run build
npm test
npx cdk synth -c stage=dev
```

### 5. Push the rollback branch and create a pull request

```bash
git push -u origin revert/<short-description>
```

Create a pull request with:

- A clear rollback title
- The affected release or pull request
- The customer or operational impact
- The reason for rollback
- Validation evidence
- The follow-up investigation owner or next action

### 6. Merge and deploy through the normal pipeline

After approval, merge the rollback pull request to `main`.

The standard GitHub Actions workflow should deploy the reverted configuration to the development environment.

Do not use `cdk destroy` as a rollback mechanism for an application release.

## Post-Rollback Verification

After the rollback deployment completes:

1. Verify that GitHub Actions completed successfully.
2. Call the health endpoint.

```bash
curl -i https://<api-id>.execute-api.<region>.amazonaws.com/health
```

3. Confirm that the endpoint returns HTTP `200`.
4. Confirm that the health response has the expected JSON shape.
5. Confirm that protected routes still require Cognito JWT authentication.
6. Confirm that the original issue no longer occurs.
7. Review CloudWatch Logs and alarms for new errors.
8. Update the incident or issue record with the rollback result.

## Follow-Up Actions

After a rollback:

- Create or update a root-cause analysis record.
- Add a regression test where practical.
- Update the relevant runbook if the investigation exposed a gap.
- Document any prevention actions.
- Plan a corrected forward release only after validation is complete.
