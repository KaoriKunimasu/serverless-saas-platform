## API Design

### POST /items
Creates a new item.

### GET /items
Returns a list of items for the authenticated user.

### GET /summary
Returns a summary of the user's items.

Each API is implemented using AWS Lambda and exposed via Amazon API Gateway. 

All API endpoints require authentication using Amazon Cognito. 

## Data Model (Draft)

Each item contains:
- userId
- itemId
- name
- amount
- createdAt

Amazon DynamoDB is used to store item data because it is fully managed, scalable, and works well with serverless architectures. 

Items are partitioned by userId so that each user can only access their own data. 