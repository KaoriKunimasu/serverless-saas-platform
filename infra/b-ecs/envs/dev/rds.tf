resource "aws_db_subnet_group" "rds" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = [for s in aws_subnet.private : s.id]

  tags = {
    Name = "${local.name}-db-subnet-group"
  }
}

resource "aws_db_parameter_group" "postgres" {
  name   = "${local.name}-pg"
  family = "postgres16"

  tags = {
    Name = "${local.name}-pg"
  }
}

resource "aws_db_instance" "postgres" {
  identifier = "${local.name}-postgres"

  engine = "postgres"

  instance_class = "db.t4g.micro"

  allocated_storage = 20
  storage_type      = "gp3"

  db_subnet_group_name   = aws_db_subnet_group.rds.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  publicly_accessible = false
  multi_az            = false

  username = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string).username
  password = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string).password
  db_name  = jsondecode(aws_secretsmanager_secret_version.db_credentials.secret_string).dbname



  backup_retention_period = 1
  skip_final_snapshot     = true
  deletion_protection     = false

  tags = {
    Name = "${local.name}-postgres"
  }
}
