# API Documentation

## Overview

This document provides API documentation for all endpoints and Convex functions.

## Base URL

- Production: `https://your-domain.com`
- Development: `http://localhost:3000`

## Authentication

All protected endpoints require authentication via Clerk. Include the authentication token in requests.

## Response Format

All API responses follow a standardized format:

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

## Error Codes

- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_ERROR` - Server error
- `SERVICE_UNAVAILABLE` - External service unavailable

## Rate Limiting

Rate limits are applied per IP and per user. Rate limit information is included in response headers:

- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Unix timestamp when limit resets

## Endpoints

### Health Check

**GET** `/api/health`

Check health status of all external services.

**Query Parameters:**
- `detailed` (optional, boolean) - Return detailed health information

**Response:**
```json
{
  "status": "healthy" | "degraded" | "unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "responseTime": 123,
  "services": [
    {
      "service": "convex",
      "status": "healthy",
      "responseTime": 45
    },
    ...
  ]
}
```

### Stripe Webhooks

**POST** `/api/webhooks/stripe`

Stripe webhook endpoint for payment events.

**Headers:**
- `stripe-signature` (required) - Stripe webhook signature

**Rate Limits:**
- 100 requests per minute per IP

## Convex Functions

### Queries

All queries require authentication and proper authorization.

#### `queries.getUserByClerkId`
Get user by Clerk ID.

**Args:**
- `clerkId` (string) - Clerk user ID

#### `queries.listPromptsByUser`
List prompts for a user with pagination.

**Args:**
- `userId` (string) - User ID
- `clerkId` (string) - Clerk ID for authorization
- `type` (optional, string) - Filter by prompt type
- `limit` (optional, number) - Items per page (max 100, default 50)
- `cursor` (optional, string) - Pagination cursor

**Response:**
```json
{
  "items": [...],
  "nextCursor": "timestamp" | null,
  "hasMore": boolean
}
```

### Mutations

All mutations require authentication and proper authorization.

#### `mutations.insertPrompt`
Create a new prompt.

**Args:**
- `userId` (string) - User ID
- `type` (string) - Prompt type
- `title` (string) - Prompt title (max 200 chars)
- `content` (string) - Prompt content (max 100,000 chars)
- `context` (optional, object) - Context data
- `metadata` (optional, object) - Metadata
- `createdAt` (number) - Creation timestamp
- `updatedAt` (number) - Update timestamp

### Actions

Actions can call external APIs and perform async operations.

#### `promptGenerators.generateCursorAppPrompts`
Generate Cursor app prompts.

**Args:**
- `projectDescription` (string) - Project description
- `techStack` (array of strings) - Technology stack
- `features` (array of strings) - Features list
- `userId` (string) - User ID
- `targetAudience` (optional, string) - Target audience

**Rate Limits:**
- Free: 50 prompts per day
- Pro: Unlimited

## Security

### CSRF Protection

All state-changing requests (POST, PUT, DELETE, PATCH) require a CSRF token.

**Headers:**
- `X-CSRF-Token` (required) - CSRF token matching the cookie value

**Cookie:**
- `csrf-token` - CSRF token (set automatically)

### Request Size Limits

- Default: 100KB
- Stripe checkout: 10KB
- Affiliate tracking: 5KB
- Webhooks: 100KB

## Rate Limits

- API requests: 100 per minute per IP
- Prompt generation (free): 50 per day
- Prompt generation (pro): Unlimited
- Chat creation (free): 3 per day
- Chat messages (free): 5 per chat

