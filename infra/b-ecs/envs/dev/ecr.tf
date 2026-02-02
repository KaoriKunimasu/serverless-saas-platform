# ----------------------------
# ECR Repositories
# ----------------------------

resource "aws_ecr_repository" "api" {
  name                 = "${local.name}-api"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name}-api"
  }
}

resource "aws_ecr_repository" "web" {
  name                 = "${local.name}-web"
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "${local.name}-web"
  }
}
