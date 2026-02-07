# Incident-004: ECS secrets injection failed (execution role missing Secrets Manager permission)

## Summary
After adding RDS + Secrets Manager and injecting `DB_PASSWORD` into the ECS task via `container_definitions.secrets`, the service started returning **503** from the ALB and **no tasks were running**. The ECS service repeatedly failed to place tasks due to an AccessDenied error when retrieving the secret.

## Impact
- ALB returned **503 Service Temporarily Unavailable**
- ECS service `project-b-dev-api` had `desiredCount=1` but `runningCount=0`
- Multiple task start attempts failed (failedTasks increased)

## Timeline (NZ time)
- 2026-02-05 05:19–05:43: ECS repeatedly started tasks then immediately failed placement with `ResourceInitializationError`
- 2026-02-05 05:48: ECS registered targets again
- 2026-02-05 05:50: Service reached steady state

Evidence (ECS service events):
- `was unable to place a task. Reason: ResourceInitializationError ... failed to fetch secret ... AccessDeniedException ... assumed-role/project-b-dev-ecs-task-exec ... is not authorized to perform: secretsmanager:GetSecretValue ...`
- later: `registered 1 targets` → `deployment completed` → `has reached a steady state.`

## Root Cause
ECS secret injection (`container_definitions.secrets`) retrieves secrets **at task startup** using the **task execution role** (`project-b-dev-ecs-task-exec`), not the task role.

Only the task role had `secretsmanager:GetSecretValue`, so ECS could not fetch the secret during resource initialization and the task never reached RUNNING.

## Detection
- ALB `/health` returned 503
- `aws ecs list-tasks` returned empty list
- `aws ecs describe-services ...` showed AccessDenied in `events`

## Resolution
Grant `secretsmanager:GetSecretValue` permission on the DB secret ARN to the **ECS task execution role**.

Terraform change:
- Attach a minimal policy allowing:
  - `secretsmanager:GetSecretValue`
  - resource: `arn:aws:secretsmanager:ap-southeast-2:515241425905:secret:project-b-dev/db/credentials-*`

After applying IAM changes:
- ECS started a task successfully
- Target registered in the ALB target group
- `/health` returned `{"status":"ok"}`

## Preventive Actions
- Document the difference between:
  - **Execution role**: image pull, logs, and secret injection at startup
  - **Task role**: app permissions at runtime
- Add a checklist item for ECS changes:
  - “If using `container_definitions.secrets`, confirm execution role can `GetSecretValue` for referenced secrets.”
