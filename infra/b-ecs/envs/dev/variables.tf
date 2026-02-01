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