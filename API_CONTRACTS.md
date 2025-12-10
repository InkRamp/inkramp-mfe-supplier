# Sales Incentive Management System - API Contracts

## Overview
This document provides comprehensive API contracts for the Sales Incentive Management System, including REST and GraphQL endpoints.

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

The JWT token is obtained from Zitadel and contains user identity, organization (brandId), and role information.

## Base URLs
- **DB Adaptor**: `https://your-api-gateway-url/db`
- **GraphQL Server**: `https://your-api-gateway-url/graphql`
- **Auth Service**: `https://your-api-gateway-url/auth`
- **Context Service**: `https://your-api-gateway-url/context`

---

## 1. DB Adaptor REST API

### 1.1 Data Seeding (WITH AUTHENTICATION)

#### Seed Brand Data
**Endpoint**: `POST /seed/:brandId`  
**Authentication**: **Required** (Bearer token)  
**Description**: Seeds the database with dummy data for testing. Extracts user info from JWT token and includes the authenticated user in the seeded data.

**Request Headers**:
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**URL Parameters**:
- `brandId` (string, required): Brand/organization identifier (e.g., "hdfc", "icici")

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "brandId": "hdfc",
    "authenticatedUser": {
      "userId": "123456789",
      "email": "user@hdfc.com",
      "role": "ADMIN"
    },
    "summary": {
      "users": 7,
      "rules": 3,
      "targets": 6,
      "incentives": 9,
      "tasks": 12
    },
    "message": "Dummy data seeded successfully"
  },
  "message": "Data seeded successfully",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "statusCode": 201
}
```

**Role-Based Behavior**:
- If token user is **ADMIN/LEAD**: User is included in seeded data with their actual details
- If token user is **SALES_EXECUTIVE**: User is included as a sales executive with incentives and targets
- The system generates additional dummy users to fill out the organization

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `400 Bad Request`: Invalid brandId
- `500 Internal Server Error`: Database or seeding error

#### Clear Brand Data
**Endpoint**: `DELETE /data/:brandId`  
**Authentication**: Optional  
**Description**: Clears all data for a brand (useful for testing/cleanup)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "brandId": "hdfc",
    "summary": {
      "tasks": 12,
      "incentives": 9,
      "targets": 6,
      "rules": 3,
      "users": 7
    },
    "message": "All data cleared successfully"
  }
}
```

### 1.2 User Management

#### Get All Users
**Endpoint**: `GET /users/:brandId`  
**Query Parameters**:
- `role` (optional): Filter by role (ADMIN, LEAD, SALES_EXECUTIVE)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49eb0a1a2f8c8b4567",
      "userId": "admin-hdfc-001",
      "email": "admin@hdfc.com",
      "name": "Admin User",
      "role": "ADMIN",
      "brandId": "hdfc",
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Get User by ID
**Endpoint**: `GET /users/:brandId/:userId`

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "60d5ec49eb0a1a2f8c8b4567",
    "userId": "se-hdfc-001",
    "email": "salesperson1@hdfc.com",
    "name": "Sales Executive 1",
    "role": "SALES_EXECUTIVE",
    "brandId": "hdfc",
    "isActive": true,
    "metadata": {},
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Create User
**Endpoint**: `POST /users/:brandId`  
**Body**:
```json
{
  "userId": "se-hdfc-004",
  "email": "newuser@hdfc.com",
  "name": "New Sales Executive",
  "role": "SALES_EXECUTIVE"
}
```

### 1.3 Incentive Rules

#### Get All Incentive Rules
**Endpoint**: `GET /incentive-rules/:brandId`  
**Query Parameters**:
- `active` (optional): "true" to get only active rules

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49eb0a1a2f8c8b4568",
      "brandId": "hdfc",
      "name": "Monthly Sales Target Bonus",
      "description": "Fixed bonus for achieving monthly sales target",
      "ruleType": "FIXED_AMOUNT",
      "criteria": "{\"minSales\":100000,\"period\":\"MONTHLY\"}",
      "rewardAmount": 5000,
      "validFrom": "2024-01-01T00:00:00.000Z",
      "validTo": "2025-01-01T00:00:00.000Z",
      "isActive": true,
      "createdBy": "admin-hdfc-001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Create Incentive Rule
**Endpoint**: `POST /incentive-rules/:brandId`  
**Body**:
```json
{
  "name": "Quarterly Revenue Commission",
  "description": "2% commission on quarterly revenue",
  "ruleType": "PERCENTAGE",
  "criteria": "{\"period\":\"QUARTERLY\",\"type\":\"REVENUE\"}",
  "rewardPercentage": 2,
  "validFrom": "2024-01-01T00:00:00.000Z",
  "validTo": "2025-01-01T00:00:00.000Z",
  "isActive": true,
  "createdBy": "admin-hdfc-001"
}
```

#### Update Incentive Rule
**Endpoint**: `PUT /incentive-rules/:brandId/:ruleId`

#### Delete Incentive Rule
**Endpoint**: `DELETE /incentive-rules/:brandId/:ruleId`

### 1.4 Incentives

#### Get Incentives
**Endpoint**: `GET /incentives/:brandId`  
**Query Parameters**:
- `userId` (optional): Filter by user
- `status` (optional): Filter by status (PENDING, APPROVED, PAID)
- `startDate` (optional): Filter by earned date start
- `endDate` (optional): Filter by earned date end

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49eb0a1a2f8c8b4569",
      "brandId": "hdfc",
      "userId": "se-hdfc-001",
      "ruleId": "60d5ec49eb0a1a2f8c8b4568",
      "amount": 5000,
      "status": "PENDING",
      "earnedDate": "2024-01-10T00:00:00.000Z",
      "metadata": {
        "targetType": "REVENUE",
        "achievedValue": 120000
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Create Incentive
**Endpoint**: `POST /incentives/:brandId`  
**Body**:
```json
{
  "userId": "se-hdfc-001",
  "ruleId": "60d5ec49eb0a1a2f8c8b4568",
  "amount": 5000,
  "status": "PENDING",
  "earnedDate": "2024-01-10T00:00:00.000Z",
  "metadata": {
    "targetType": "REVENUE",
    "achievedValue": 120000
  }
}
```

#### Update Incentive
**Endpoint**: `PUT /incentives/:brandId/:incentiveId`

### 1.5 Targets

#### Get Targets
**Endpoint**: `GET /targets/:brandId`  
**Query Parameters**:
- `userId` (optional): Filter by user
- `status` (optional): Filter by status (ACTIVE, COMPLETED, FAILED)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49eb0a1a2f8c8b4570",
      "brandId": "hdfc",
      "userId": "se-hdfc-001",
      "targetType": "REVENUE",
      "targetValue": 100000,
      "currentValue": 75000,
      "period": "MONTHLY",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "status": "ACTIVE",
      "createdBy": "admin-hdfc-001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Create Target
**Endpoint**: `POST /targets/:brandId`  
**Body**:
```json
{
  "userId": "se-hdfc-001",
  "targetType": "REVENUE",
  "targetValue": 100000,
  "currentValue": 0,
  "period": "MONTHLY",
  "startDate": "2024-01-01T00:00:00.000Z",
  "endDate": "2024-01-31T23:59:59.999Z",
  "status": "ACTIVE",
  "createdBy": "admin-hdfc-001"
}
```

#### Update Target
**Endpoint**: `PUT /targets/:brandId/:targetId`

#### Delete Target
**Endpoint**: `DELETE /targets/:brandId/:targetId`

### 1.6 Tasks

#### Get Tasks
**Endpoint**: `GET /tasks/:brandId`  
**Query Parameters**:
- `userId` (optional): Filter by user
- `status` (optional): Filter by status (TODO, IN_PROGRESS, COMPLETED)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49eb0a1a2f8c8b4571",
      "brandId": "hdfc",
      "userId": "se-hdfc-001",
      "title": "Follow up with lead",
      "description": "Contact the prospect and schedule a demo",
      "status": "TODO",
      "priority": "HIGH",
      "dueDate": "2024-01-20T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

#### Create Task
**Endpoint**: `POST /tasks/:brandId`  
**Body**:
```json
{
  "userId": "se-hdfc-001",
  "title": "Follow up with lead",
  "description": "Contact the prospect and schedule a demo",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2024-01-20T00:00:00.000Z"
}
```

#### Update Task
**Endpoint**: `PUT /tasks/:brandId/:taskId`

#### Delete Task
**Endpoint**: `DELETE /tasks/:brandId/:taskId`

### 1.7 Organizations

#### Get All Organizations
**Endpoint**: `GET /organizations`  
**Query Parameters**:
- `status` (optional): Filter by status

#### Get Organization by ID
**Endpoint**: `GET /organizations/:orgId`

#### Create Organization
**Endpoint**: `POST /organizations`  
**Body**:
```json
{
  "organizationId": "hdfc",
  "name": "HDFC Bank",
  "status": "active",
  "metadata": {
    "industry": "banking",
    "region": "india"
  }
}
```

---

## 2. GraphQL API

### Base URL
`POST https://your-api-gateway-url/graphql`

### Authentication
Include JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

### 2.1 User Queries

#### Get Current User
```graphql
query {
  me {
    id
    userId
    email
    name
    role
    brandId
    org
    isActive
  }
}
```

**Response**:
```json
{
  "data": {
    "me": {
      "id": "123456789",
      "userId": "se-hdfc-001",
      "email": "user@hdfc.com",
      "name": "John Doe",
      "role": "SALES_EXECUTIVE",
      "brandId": "hdfc",
      "org": "hdfc",
      "isActive": true
    }
  }
}
```

### 2.2 Incentive Queries

#### Get My Incentives
```graphql
query MyIncentives($status: String, $limit: Int) {
  myIncentives(status: $status, limit: $limit) {
    id
    amount
    status
    earnedDate
    paidDate
    rule {
      name
      description
      ruleType
      rewardAmount
      rewardPercentage
    }
  }
}
```

**Variables**:
```json
{
  "status": "APPROVED",
  "limit": 10
}
```

**Response**:
```json
{
  "data": {
    "myIncentives": [
      {
        "id": "60d5ec49eb0a1a2f8c8b4569",
        "amount": 5000,
        "status": "APPROVED",
        "earnedDate": "2024-01-10T00:00:00.000Z",
        "paidDate": null,
        "rule": {
          "name": "Monthly Sales Target Bonus",
          "description": "Fixed bonus for achieving monthly sales target",
          "ruleType": "FIXED_AMOUNT",
          "rewardAmount": 5000,
          "rewardPercentage": null
        }
      }
    ]
  }
}
```

#### Get Incentive History
```graphql
query IncentiveHistory {
  incentiveHistory {
    id
    amount
    status
    earnedDate
    paidDate
    rule {
      name
      description
    }
  }
}
```

### 2.3 Target Queries

#### Get My Targets
```graphql
query MyTargets {
  myTargets {
    id
    targetType
    targetValue
    currentValue
    period
    status
    startDate
    endDate
    progress
  }
}
```

**Response**:
```json
{
  "data": {
    "myTargets": [
      {
        "id": "60d5ec49eb0a1a2f8c8b4570",
        "targetType": "REVENUE",
        "targetValue": 100000,
        "currentValue": 75000,
        "period": "MONTHLY",
        "status": "ACTIVE",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-01-31T23:59:59.999Z",
        "progress": 75
      }
    ]
  }
}
```

### 2.4 Task Queries

#### Get My Tasks
```graphql
query MyTasks($status: String) {
  myTasks(status: $status) {
    id
    title
    description
    status
    priority
    dueDate
  }
}
```

#### Get All Tasks (Admin/Lead only)
```graphql
query AllTasks($brandId: String!, $userId: String) {
  tasks(brandId: $brandId, userId: $userId) {
    id
    title
    status
    priority
    dueDate
    user {
      userId
      name
      email
    }
  }
}
```

### 2.5 Admin Queries

#### Get All Users (Admin/Lead only)
```graphql
query AllUsers($brandId: String!, $role: String) {
  users(brandId: $brandId, role: $role) {
    id
    userId
    email
    name
    role
    isActive
  }
}
```

#### Get All Incentive Rules (Admin/Lead only)
```graphql
query AllIncentiveRules($brandId: String!) {
  incentiveRules(brandId: $brandId) {
    id
    name
    description
    ruleType
    rewardAmount
    rewardPercentage
    isActive
    validFrom
    validTo
  }
}
```

### 2.6 Mutations

#### Create Incentive Rule (Admin/Lead only)
```graphql
mutation CreateIncentiveRule($input: IncentiveRuleInput!) {
  createIncentiveRule(input: $input) {
    id
    name
    description
    ruleType
    isActive
  }
}
```

**Variables**:
```json
{
  "input": {
    "brandId": "hdfc",
    "name": "New Customer Bonus",
    "description": "Bonus for acquiring new customers",
    "ruleType": "FIXED_AMOUNT",
    "rewardAmount": 1000,
    "criteria": "{\"action\":\"NEW_CUSTOMER\"}",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validTo": "2025-01-01T00:00:00.000Z",
    "isActive": true
  }
}
```

#### Update Task
```graphql
mutation UpdateTask($id: ID!, $input: TaskUpdateInput!) {
  updateTask(id: $id, input: $input) {
    id
    title
    status
    updatedAt
  }
}
```

**Variables**:
```json
{
  "id": "60d5ec49eb0a1a2f8c8b4571",
  "input": {
    "status": "COMPLETED"
  }
}
```

#### Create Target (Admin/Lead only)
```graphql
mutation CreateTarget($input: TargetInput!) {
  createTarget(input: $input) {
    id
    targetType
    targetValue
    period
  }
}
```

---

## 3. Common Data Types

### User Roles
- `ADMIN`: Full access to create rules, manage users, view all data
- `LEAD`: Can create rules, manage team, view team data
- `SALES_EXECUTIVE`: View own incentives, tasks, and targets

### Incentive Statuses
- `PENDING`: Incentive earned but not yet approved
- `APPROVED`: Incentive approved for payment
- `PAID`: Incentive has been paid out

### Target Types
- `REVENUE`: Revenue-based target (in currency)
- `UNITS`: Unit/count-based target (e.g., number of sales)

### Target Statuses
- `ACTIVE`: Currently active target
- `COMPLETED`: Target achieved
- `FAILED`: Target period ended without achievement

### Task Statuses
- `TODO`: Not started
- `IN_PROGRESS`: Currently being worked on
- `COMPLETED`: Finished

### Task Priorities
- `URGENT`: Highest priority
- `HIGH`: High priority
- `MEDIUM`: Medium priority
- `LOW`: Low priority

### Rule Types
- `FIXED_AMOUNT`: Fixed monetary reward
- `PERCENTAGE`: Percentage-based reward

---

## 4. Error Handling

All APIs return errors in the following format:

**REST API**:
```json
{
  "success": false,
  "message": "Error message",
  "statusCode": 400,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "errors": {
    "field": "error details"
  }
}
```

**GraphQL API**:
```json
{
  "errors": [
    {
      "message": "Error message",
      "locations": [{"line": 2, "column": 3}],
      "path": ["myIncentives"],
      "extensions": {
        "code": "UNAUTHENTICATED"
      }
    }
  ]
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## 5. Integration Examples

### Example: Seeding Data with User Token

**Step 1**: Obtain JWT token from Zitadel authentication

**Step 2**: Call seed endpoint
```bash
curl -X POST https://your-api-gateway-url/db/seed/hdfc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Step 3**: Verify data was seeded
```bash
curl -X GET https://your-api-gateway-url/db/users/hdfc \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example: Getting Sales Executive Dashboard Data

**GraphQL Query**:
```graphql
query Dashboard {
  me {
    name
    email
    role
  }
  myTargets {
    targetType
    targetValue
    currentValue
    progress
  }
  myIncentives(status: "APPROVED") {
    amount
    earnedDate
  }
  myTasks(status: "TODO") {
    title
    priority
    dueDate
  }
}
```

---

## 6. Notes for MFE Development

1. **Authentication**: Always include the JWT token in the Authorization header for authenticated endpoints
2. **Brand Context**: Most endpoints require a `brandId` parameter - this should match the user's organization
3. **Role-Based Access**: UI should adapt based on user role (ADMIN/LEAD vs SALES_EXECUTIVE)
4. **Error Handling**: Implement proper error handling for 401/403 responses to redirect to login
5. **Real-time Updates**: Consider using GraphQL subscriptions for real-time updates (not yet implemented)
6. **Pagination**: Currently not implemented - will be added in future iterations
7. **Caching**: Consider implementing client-side caching for frequently accessed data

---

## 7. MFE Implementation

### Configuration

Update `src/app/config/data.config.ts`:
```typescript
export const DATA_CONFIG: DataConfig = {
  useGraphQL: true,  // Enable GraphQL
  useRestAPI: true,  // Enable REST API
  endpoints: {
    graphql: 'https://your-api-gateway-url/graphql',
    dbAdaptor: 'https://your-api-gateway-url/db',
    authService: 'https://your-api-gateway-url/auth',
    contextService: 'https://your-api-gateway-url/context'
  },
  mockDataDelay: 300
};
```

### Using the API Service

```typescript
import { ApiService } from './services/api.service';
import { IncentiveStatus } from './models/api-types';

constructor(private apiService: ApiService) {}

ngOnInit() {
  // Get incentives for current user
  this.apiService.getIncentives('hdfc', {
    userId: 'se-hdfc-001',
    status: IncentiveStatus.APPROVED
  }).subscribe(response => {
    if (response.success) {
      console.log('Incentives:', response.data);
    }
  });

  // Get targets
  this.apiService.getTargets('hdfc', {
    userId: 'se-hdfc-001'
  }).subscribe(response => {
    if (response.success) {
      console.log('Targets:', response.data);
    }
  });
}
```

### Using GraphQL Queries

```typescript
import { DataService } from './services/data.service';
import { INCENTIVE_QUERIES, TARGET_QUERIES } from './graphql/queries';

constructor(private dataService: DataService) {}

ngOnInit() {
  // Use GraphQL directly through DataService
  this.dataService.queryGraphQL(
    INCENTIVE_QUERIES.GET_MY_INCENTIVES,
    { status: 'APPROVED', limit: 10 }
  ).subscribe(response => {
    console.log('My Incentives:', response.data.myIncentives);
  });
}
```

---

## 8. Future Enhancements

- GraphQL Subscriptions for real-time updates
- Pagination support for large datasets
- Advanced filtering and search capabilities
- Batch operations for bulk data management
- Webhook notifications for incentive status changes
- Export functionality for reports
- Offline support with local caching
- Performance monitoring and analytics
