# Generate password once
resource "random_password" "db_password" {
  length  = 24
  special = true
}

############################################
# Secret 1: JSON credentials (used by RDS)
############################################
resource "aws_secretsmanager_secret" "db_credentials" {
  name = "${local.name}/db/credentials"

  tags = {
    Name = "${local.name}-db-credentials"
  }
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id

  secret_string = jsonencode({
    username = "app_user"
    password = random_password.db_password.result
    dbname   = "appdb"
    port     = 5432
  })
}

############################################
# Secret 2: plaintext password (used by ECS injection)
############################################
resource "aws_secretsmanager_secret" "db_password" {
  name = "${local.name}/db/password"

  tags = {
    Name = "${local.name}-db-password"
  }
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db_password.result
}
