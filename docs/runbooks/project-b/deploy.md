# Runbook: Deploy (Project B API)

## Purpose
Deploy a new API image to ECS using GitHub Actions.

## Steps
1. Push changes to main or project-b/*
2. GitHub Actions → "Project B - deploy dev (api)" runs automatically
3. Wait until ECS service becomes stable

## Verification
curl http://<ALB>/health
curl http://<ALB>/db-check

Expected:
200 {"status":"ok"}

## Failure checks
- GitHub Actions logs
- ECS service events
- CloudWatch logs
