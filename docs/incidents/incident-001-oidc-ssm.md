# Incident-001: CDK deploy failed due to missing SSM permission

## Summary
GitHub Actions OIDC role could not read CDK bootstrap version from SSM.

## Impact
- CI deploy-dev job failed
- No production impact

## Root Cause
Deploy role lacked ssm:GetParameter permission for
/cdk-bootstrap/hnb659fds/version

## Detection
GitHub Actions deploy-dev job failed with AccessDeniedException.

## Resolution
Added inline policy to deploy role allowing:
- ssm:GetParameter
- sts:AssumeRole for cdk-hnb659fds-*

## Prevention
- Separate readonly and deploy roles
- Document required bootstrap permissions
