output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = [for s in aws_subnet.public : s.id]
}

output "private_subnet_ids" {
  value = [for s in aws_subnet.private : s.id]
}

output "azs" {
  value = local.azs
}

output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "ecs_sg_id" {
  value = aws_security_group.ecs.id
}

output "rds_sg_id" {
  value = aws_security_group.rds.id
}

output "ecs_task_execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "ecs_task_role_arn" {
  value = aws_iam_role.ecs_task.arn
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "api_ecr_url" {
  value = aws_ecr_repository.api.repository_url
}

output "web_ecr_url" {
  value = aws_ecr_repository.web.repository_url
}
output "alb_dns_name" {
  value = var.enable_alb ? aws_lb.api[0].dns_name : ""
}

output "rds_endpoint" {
  value = aws_db_instance.postgres.address
}

output "db_secret_arn" {
  value = aws_secretsmanager_secret.db_password.arn
}

