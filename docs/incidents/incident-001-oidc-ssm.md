# Incident-001: CDK deploy failed due to missing SSM permission

## Summary
GitHub Actions OIDC role could not read the CDK bootstrap version from SSM, causing `cdk deploy` to fail.

## Impact
- CI deploy job failed
- No production impact

## Root Cause
The role used by GitHub Actions at the time (`github-actions-cdk-readonly`) lacked `ssm:GetParameter` permission for:
- `/cdk-bootstrap/hnb659fds/version`

As a result, CDK could not confirm the required bootstrap stack version.

## Detection
GitHub Actions deploy job failed with `AccessDeniedException` for `ssm:GetParameter`.

## Resolution
- Created/updated a deploy role (`github-actions-cdk-deploy`) with required permissions:
  - `ssm:GetParameter` for `/cdk-bootstrap/hnb659fds/version`
  - `sts:AssumeRole` for `cdk-hnb659fds-*` bootstrap roles
- Updated the workflow to assume the deploy role for deployment.

## Prevention
- Keep separate roles for smoke/read-only vs deploy
- Add a preflight SSM check step before `cdk deploy` to fail fast with a clear error
