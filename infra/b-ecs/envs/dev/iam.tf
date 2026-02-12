# ----------------------------
# IAM for ECS tasks
# ----------------------------

data "aws_iam_policy_document" "ecs_task_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# Execution role: pull images + logs + read Secrets Manager for injection
resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.name}-ecs-task-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Allow ECS execution role to read DB password secret
data "aws_iam_policy_document" "ecs_task_execution_secrets_read" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = ["${aws_secretsmanager_secret.db_password.arn}*"]

  }
}

resource "aws_iam_policy" "ecs_task_execution_secrets_read" {
  name   = "${local.name}-ecs-task-exec-secrets-read"
  policy = data.aws_iam_policy_document.ecs_task_execution_secrets_read.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets_read" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = aws_iam_policy.ecs_task_execution_secrets_read.arn
}

# Task role: app permissions only (no secrets needed here)
resource "aws_iam_role" "ecs_task" {
  name               = "${local.name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

