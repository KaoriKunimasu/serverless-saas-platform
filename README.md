# Serverless Saas Platform (Portfolio)

## Projects
- Project A: Serverless Saas (CDK)
- Project B: AI Full-stack (planned)
- Project C: ECS Production (planned)
- Project D: Data pipeline (planned)

## How to run (quick)
- Infrastructure (CDK): see `cdk/`
- Apps: will liver under `apps/`
- Docs/standards: see `docs/`

## API Design

### POST /items
Creates a new item.

### GET /items
Returns a list of items for the authenticated user.

### GET /summary
Returns a summary of the user's items.

Each API is implemented using AWS Lambda and exposed via Amazon API Gateway. 

All API endpoints require authentication using Amazon Cognito. 

## Authentication (Planned)

- Amazon Cognito User Pool is used for user authentication.
- The frontend obtains a JWT after login. 
- Amazon API Gateway uses a Cognito Authorizer to validate the JWT. 
- Lambda functions read the user identity from the request context and use it as userId. 

## Data Model (Draft)

Each item contains:
- userId
- itemId
- name
- amount
- createdAt

Amazon DynamoDB is used to store item data because it is fully managed, scalable, and works well with serverless architectures. 

Items are partitioned by userId so that each user can only access their own data. 

## DynamoDB Table Design (Draft)

Table: Items

- Partition key (PK): userId (String)
- Sort key (SK): itemId (String)

Attributes:
- name (String)
- amount (Number)
- createdAt (String, ISO 8601)

## Architecture (High Level)

- Frontend: S3 + CloudFront (planned)
- Auth: Amazon Cognito User Pool
- API: Amazon API Gateway
- Compute: AWS Lambda
- Database: Amazon DynamoDB
- Scheduler: Amazon EventBridge (planned)
- Email: Amazon SES (planned)

## Architecture Diagram (Draft)

```mermaid
flowchart LR
    U[User] --> CF[CloudFront]
    CF --> S3[S3 Frontend]
    U -->|Login| COG[Cognito User Pool]
    U -->|JWT| APIGW[API Gateway]
    APIGW --> L1[Lambda: POST /items]
    APIGW --> L2[Lambda: GET /items]
    APIGW --> L3[Lambda: GET /summary]
    L1 --> DDB[DynamoDB Items]
    L2 --> DDB
    L3 --> DDB
    EB[EventBridge] --> L3
    L3 --> SES[SES Email]