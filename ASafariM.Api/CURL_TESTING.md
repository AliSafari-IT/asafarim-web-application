# ASafariM.Api cURL Test Commands

## Base URL
http://localhost:5242

## Authentication Endpoints

### Register New User
```bash
curl -X POST http://localhost:5242/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "acceptTerms": true
  }'
```

### Login User
```bash
curl -X POST http://localhost:5242/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "TestPassword123!",
    "rememberMe": false
  }'
```

## Project Endpoints (Requires Authentication)

### Get All Projects
```bash
curl -X GET http://localhost:5242/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Create New Project
```bash
curl -X POST http://localhost:5242/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "My Awesome Project",
    "description": "This is a test project created via API",
    "status": "In Progress",
    "priority": "High",
    "startDate": "2025-07-26",
    "tags": ["react", "typescript", "api"],
    "isPublic": true,
    "isFeatured": false
  }'
```

## User Endpoints (Requires Authentication)

### Get Current User Profile
```bash
curl -X GET http://localhost:5242/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Get User Projects
```bash
curl -X GET http://localhost:5242/api/users/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Get User Repositories
```bash
curl -X GET http://localhost:5242/api/users/repositories \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Testing Steps:

### Step 1: Register a new user
```bash
curl -X POST http://localhost:5242/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPassword123!",
    "confirmPassword": "TestPassword123!",
    "firstName": "Test",
    "lastName": "User",
    "acceptTerms": true
  }'
```

### Step 2: Login to get JWT token
```bash
curl -X POST http://localhost:5242/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "TestPassword123!",
    "rememberMe": false
  }'
```

### Step 3: Use the JWT token from login response
Copy the "token" value from the login response and use it in subsequent requests by replacing `YOUR_JWT_TOKEN_HERE` with the actual token.

## Alternative: Using PowerShell (Windows)

### Register User (PowerShell)
```powershell
$body = @{
    username = "testuser"
    email = "test@example.com"
    password = "TestPassword123!"
    confirmPassword = "TestPassword123!"
    firstName = "Test"
    lastName = "User"
    acceptTerms = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5242/api/auth/register" -Method Post -Body $body -ContentType "application/json"
```

### Login User (PowerShell)
```powershell
$loginBody = @{
    emailOrUsername = "test@example.com"
    password = "TestPassword123!"
    rememberMe = $false
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://localhost:5242/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.data.token
Write-Host "JWT Token: $token"
```

## Alternative: Using VS Code REST Client Extension

If you install the "REST Client" extension in VS Code, you can use the original HTTP format from API_TESTING.md directly in VS Code by creating a `.http` or `.rest` file.
