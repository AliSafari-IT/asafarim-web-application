# ASafariM Database Population Script

This directory contains scripts to populate your ASafariM database with mock data for testing and development purposes.

## Prerequisites

1. **Backend API Running**: Make sure your ASafariM API is running on `http://localhost:5242`
2. **Database Connected**: Ensure your PostgreSQL database is connected and migrations are applied
3. **Node.js**: You need Node.js installed to run the population script

## Setup

1. Navigate to the db-data directory:

   ```bash
   cd db-data
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

## Usage

### Quick Start

```bash
npm run populate
```

### Manual Run

```bash
node populate-db.js
```

## What it Does

The script will:

1. **🔐 Authenticate**: Creates/logs in as admin user (`admin@asafarim.com`)
2. **👥 Create Users**: Generates 15 random users with realistic data
3. **📁 Create Projects**: Generates 25 random projects assigned to the created users

## Configuration

You can modify the configuration in `populate-db.js`:

```javascript
const API_BASE_URL = "http://localhost:5242/api";
const ADMIN_CREDENTIALS = {
    email: "admin@asafarim.com",
    password: "Admin123!",
    username: "admin"
};
```

## Data Types

The `data.js` file contains TypeScript-like definitions for all your database models:

- **TechStack**: Technology stacks with categories, versions, and ratings
- **Project**: Projects with status, priority, dates, and URLs
- **User**: User accounts with profiles and authentication
- **UserPreferences**: User settings for theme, language, notifications
- **Repository**: Code repositories with GitHub-like metadata

## Sample Data Generated

### Users

- Random usernames like `user_abc123`
- Email addresses matching usernames
- Default password: `User123!`
- Random profile data (names, bio, location)

### Projects

- Random project titles and descriptions
- Various statuses: Planning, In Progress, Completed, On Hold
- Random priorities: Low, Medium, High, Critical
- Realistic dates, budgets, and progress percentages
- Mock URLs for thumbnails, repositories, and live demos

## Troubleshooting

### API Connection Issues

- Verify your backend is running on the correct port
- Check your `appsettings.Development.json` for the correct database connection
- Ensure CORS is configured to allow requests

### Authentication Errors

- The script will try to register the admin user first
- If registration fails, it will attempt to login with existing credentials
- Check your JWT configuration in the backend

### Database Errors

- Ensure your PostgreSQL database is running
- Verify database migrations have been applied
- Check database connection string in your backend configuration

## Extending the Script

To add more data types or modify existing ones:

1. Update the data generators in `populate-db.js`
2. Add new API endpoints in your controllers
3. Create new population functions following the existing pattern

Example:

```javascript
const populateTechStacks = async (token, count = 10) => {
    // Implementation here
};
```

## API Endpoints Used

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/projects` - Project creation
- `GET /api/projects` - Project listing (for verification)

## Notes

- The script includes delays between API calls to avoid overwhelming the server
- All generated data is realistic but fake - safe for development/testing
- The admin user credentials are hardcoded for development purposes only
- Generated projects are randomly assigned to created users
