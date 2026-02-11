resource "aws_lb" "api" {
  count = var.enable_alb ? 1 : 0
  name               = "${local.name}-alb"
  load_balancer_type = "application"
  internal           = false

  subnets         = var.public_subnet_ids
  security_groups = [var.alb_sg_id]

  tags = {
    Name = "${local.name}-alb"
  }
}

resource "aws_lb_target_group" "api" {
  count       = var.enable_alb ? 1 : 0
  name        = "${local.name}-api-tg"
  port        = var.app_port
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Name = "${local.name}-api-tg"
  }
}

resource "aws_lb_listener" "http" {
  count = var.enable_alb ? 1 : 0
  load_balancer_arn = aws_lb.api[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api[0].arn
  }
}
