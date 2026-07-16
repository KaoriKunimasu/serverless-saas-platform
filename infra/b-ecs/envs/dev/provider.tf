provider "aws" {
  region = var.aws_region

  # Applied to every taggable resource in this root, so individual
  # resources only carry the tags specific to them (Name, mostly).
  default_tags {
    tags = {
      project = var.project
      stage   = var.env
      owner   = var.owner
    }
  }
}
