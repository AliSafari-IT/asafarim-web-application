# ASafariM.Api Test Endpoints

## Base URL
http://localhost:5242

## Authentication Endpoints

### Register New User
POST http://localhost:5242/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "TestPassword123!",
  "confirmPassword": "TestPassword123!",
  "firstName": "Test",
  "lastName": "User",
  "acceptTerms": true
}

### Login User
POST http://localhost:5242/api/auth/login
Content-Type: application/json

{
  "emailOrUsername": "test@example.com",
  "password": "TestPassword123!",
  "rememberMe": false
}

## Project Endpoints (Requires Authentication)

### Get All Projects
GET http://localhost:5242/api/projects
Authorization: Bearer YOUR_JWT_TOKEN_HERE

curl -X GET http://localhost:5242/api/projects -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1laWQiOiJiMjJiZTI2OC1lNDMwLTRhYTEtYTVjMy1lOTQ1NDQ3YzM3MWIiLCJ1bmlxdWVfbmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IlVzZXIiLCJuYmYiOjE3NTM1NTg2OTAsImV4cCI6MTc1MzY0NTA5MCwiaWF0IjoxNzUzNTU4NjkwfQ.iUjFcsgky6ilOMfgGEbC8x9HZkqf52bCA06YzqPzN9A"

### Create New Project
POST http://localhost:5242/api/projects
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN_HERE

{
  "title": "My Awesome Project",
  "description": "This is a test project created via API",
  "status": "In Progress",
  "priority": "High",
  "startDate": "2025-07-26",
  "tags": ["react", "typescript", "api"],
  "isPublic": true,
  "isFeatured": false
}

## User Endpoints (Requires Authentication)

### Get Current User Profile
GET http://localhost:5242/api/users/profile
Authorization: Bearer YOUR_JWT_TOKEN_HERE

### Get User Projects
GET http://localhost:5242/api/users/projects
Authorization: Bearer YOUR_JWT_TOKEN_HERE

### Get User Repositories
GET http://localhost:5242/api/users/repositories
Authorization: Bearer YOUR_JWT_TOKEN_HERE

## Testing Steps:
1. Start the API server: `dotnet run`
2. Register a new user using the register endpoint
3. Login with the registered user to get a JWT token
4. Use the JWT token in the Authorization header for protected endpoints
5. Test creating projects, getting user profile, etc.

## OpenAPI/Swagger Documentation
http://localhost:5242/openapi/v1.json
