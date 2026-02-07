############################################
# GitHub Actions OIDC role for Project B
############################################

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}


data "aws_iam_policy_document" "project_b_github_assume_role" {
  statement {
    effect  = "Allow"
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringLike"
      variable = "token.actions.githubusercontent.com:sub"
      values = [
        "repo:KaoriKunimasu/serverless-saas-platform:ref:refs/heads/main"
      ]
    }
  }
}

resource "aws_iam_role" "github_actions_project_b" {
  name               = "github-actions-project-b-deploy"
  assume_role_policy = data.aws_iam_policy_document.project_b_github_assume_role.json
}

data "aws_iam_policy_document" "project_b_deploy_policy" {

  statement {
    effect = "Allow"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = ["*"]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:CompleteLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:InitiateLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:DescribeRepositories"
    ]
    resources = [
      "arn:aws:ecr:ap-southeast-2:515241425905:repository/project-b-dev-api"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecs:UpdateService",
      "ecs:DescribeServices"
    ]
    resources = [
      "arn:aws:ecs:ap-southeast-2:515241425905:service/project-b-dev-cluster/project-b-dev-api"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
      "ecs:DescribeClusters"
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "ecs:DescribeTaskDefinition",
      "ecs:RegisterTaskDefinition"
    ]
    resources = ["*"]
  }
  statement {
    effect = "Allow"
    actions = [
      "iam:PassRole"
    ]
    resources = [
      "arn:aws:iam::515241425905:role/project-b-dev-ecs-task-exec",
      "arn:aws:iam::515241425905:role/project-b-dev-ecs-task"
    ]
    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }

}

resource "aws_iam_policy" "project_b_deploy" {
  name   = "project-b-deploy"
  policy = data.aws_iam_policy_document.project_b_deploy_policy.json
}

resource "aws_iam_role_policy_attachment" "project_b_deploy_attach" {
  role       = aws_iam_role.github_actions_project_b.name
  policy_arn = aws_iam_policy.project_b_deploy.arn
}
