# Shared token for the /burn load-test endpoint. This is not user-facing
# auth: it exists so the endpoint on the public ALB isn't an open invitation
# to burn CPU anonymously. The deploy workflow reads this same secret to
# call /burn during its smoke test.
resource "random_password" "burn_token" {
  length = 32
  # Keep it safe to drop straight into an Authorization header.
  special = false
}

resource "aws_secretsmanager_secret" "burn_token" {
  name = "${local.name}/burn/token"

  tags = {
    Name = "${local.name}-burn-token"
  }
}

resource "aws_secretsmanager_secret_version" "burn_token" {
  secret_id     = aws_secretsmanager_secret.burn_token.id
  secret_string = random_password.burn_token.result
}
