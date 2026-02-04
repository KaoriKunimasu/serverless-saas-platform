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

# Execution role: pull images + write logs (AWS managed policy)
resource "aws_iam_role" "ecs_task_execution" {
  name               = "${local.name}-ecs-task-exec"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task role: application permissions (keep minimal; extend later for Secrets/RDS)
resource "aws_iam_role" "ecs_task" {
  name               = "${local.name}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_task_assume_role.json
}

data "aws_iam_policy_document" "ecs_task_minimal" {
  statement {
    effect    = "Allow"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["*"]
  }
}

resource "aws_iam_policy" "ecs_task_minimal" {
  name   = "${local.name}-ecs-task-minimal"
  policy = data.aws_iam_policy_document.ecs_task_minimal.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_minimal" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task_minimal.arn
}

data "aws_iam_policy_document" "ecs_task_secrets_read" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = [
      aws_secretsmanager_secret.db_credentials.arn
    ]
  }
}

resource "aws_iam_policy" "ecs_task_secrets_read" {
  name   = "${local.name}-ecs-task-secrets-read"
  policy = data.aws_iam_policy_document.ecs_task_secrets_read.json
}

resource "aws_iam_role_policy_attachment" "ecs_task_secrets_read" {
  role       = aws_iam_role.ecs_task.name
  policy_arn = aws_iam_policy.ecs_task_secrets_read.arn
}
data "aws_iam_policy_document" "ecs_task_execution_secrets_read" {
  statement {
    effect = "Allow"
    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = [
      aws_secretsmanager_secret.db_credentials.arn
    ]
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
