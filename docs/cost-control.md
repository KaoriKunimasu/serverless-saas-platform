# Cost Control Guide – Project B

This environment is optimized to minimize AWS costs when not actively testing.

---

## Estimated Cost (running)

| Resource | Approx |
|-----------|-----------|
| ECS Fargate | $10–20/mo |
| RDS t3.micro | $15–20/mo |
| ALB | $20–25/mo |
| NAT Gateway | $30–40/mo |

Total ≈ $70–100/mo

---

## Stop All (recommended after testing)

### Step 1 – scale ECS to zero
```bash
aws ecs update-service \
  --cluster project-b-dev-cluster \
  --service project-b-dev-api \
  --desired-count 0
```

### Step 2 – stop database
```bash
aws rds stop-db-instance --db-instance-identifier project-b-dev-postgres
```

### Step 3 – delete expensive network resources
```bash
terraform destroy \
  -target aws_lb.api \
  -target aws_nat_gateway.this \
  -target aws_eip.nat
```

Cost becomes near $0.

---

## Start Again
```bash
terraform apply
aws rds start-db-instance --db-instance-identifier project-b-dev-postgres
aws ecs update-service --cluster project-b-dev-cluster --service project-b-dev-api --desired-count 1
```

---

## Notes
- ECR + Logs are very cheap → safe to keep
- NAT + ALB are the main cost drivers
- Destroy when not testing