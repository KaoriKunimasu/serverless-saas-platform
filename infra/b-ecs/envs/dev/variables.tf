variable "project" {
  type    = string
  default = "project-b"
}

variable "env" {
  type    = string
  default = "dev"
}

variable "aws_region" {
  type    = string
  default = "ap-southeast-2"
}

variable "vpc_cidr" {
  type    = string
  default = "10.20.0.0/16"
}
variable "app_port" {
  type    = number
  default = 3000
}
variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_sg_id" {
  type = string
}
variable "public_subnet_ids" {
  type = list(string)
}

variable "alb_sg_id" {
  type = string
}

variable "vpc_id" {
  type = string
}
