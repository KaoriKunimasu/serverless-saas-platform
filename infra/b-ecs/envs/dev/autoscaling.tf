############################################
# ECS Service Auto Scaling (API)
############################################

resource "aws_appautoscaling_target" "api" {
  min_capacity       = 1
  max_capacity       = 3
  service_namespace  = "ecs"
  scalable_dimension = "ecs:service:DesiredCount"

  # IMPORTANT:
  # resource_id must be: service/<cluster-name>/<service-name>
  resource_id = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.api.name}"
}

resource "aws_appautoscaling_policy" "api_cpu_target" {
  name               = "${local.name}-api-cpu-target"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.api.service_namespace
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  resource_id        = aws_appautoscaling_target.api.resource_id

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = 70
    scale_out_cooldown = 60
    scale_in_cooldown  = 180
  }
}
