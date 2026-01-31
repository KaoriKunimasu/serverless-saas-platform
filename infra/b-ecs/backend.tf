terraform {
  backend "s3" {
    bucket         = "kaori-serverless-project-b-tf-state"
    key            = "project-b/dev/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "project-b-terraform-locks"
    encrypt        = true
  }
}
