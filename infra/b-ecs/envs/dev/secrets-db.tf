resource "random_password" "db_password" {
  length  = 24
  special = true
}

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
