# Incident-002: ALB returns 503 due to unhealthy targets

## Summary

When accessing the API through the Application Load Balancer (ALB),
requests returned HTTP 503 and the target group was marked as unhealthy.

## Impact

- API was not accessible via ALB
- Health check endpoint was unreachable

## Detection

- ALB target group health checks failed
- Direct access to the ALB DNS returned HTTP 503

## Root Cause

The API container was bound to `127.0.0.1`.  
For ECS Fargate behind an ALB, the application must listen on `0.0.0.0`.

## Resolution

The Express application was updated to bind to `0.0.0.0`.  
The `PORT` environment variable was also explicitly converted to a number.
```ts
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`b-api listening on port ${port}`);
});
```

## Prevention

- Always bind containerized applications to `0.0.0.0`
- Explicitly define a health check endpoint for ALB
- Add ECS + ALB validation items to the deployment checklist

## Lessons Learned

- Network assumptions differ between local containers and ALB-backed services
- This issue could have been detected earlier during container testing

---

## Checklist

### ECS + ALB Checklist

- [ ] Application listens on `0.0.0.0`
- [ ] `PORT` is handled as a number
- [ ] `/health` endpoint exists and returns 200
- [ ] ALB target group health check path matches the application endpoint