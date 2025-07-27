// # D:\repos\asafarim-web-application\ASafariM.Api\Models\TechStack.cs
// D:\repos\asafarim-web-application\ASafariM.Api\Models\Project.cs
// D:\repos\asafarim-web-application\ASafariM.Api\Models\User.cs
// D:\repos\asafarim-web-application\ASafariM.Api\Models\BaseEntity.cs
// D:\repos\asafarim-web-application\ASafariM.Api\Models\Repository.cs
// D:\repos\asafarim-web-application\ASafariM.Api\Models\UserPreferences.cs
const techStackDataType = {
    "id": "guid",
    "name": "string",
    "description": "string",
    "category": "string",
    "techVersion": "string",
    "iconUrl": "string",
    "documentationUrl": "string",
    "officialWebsite": "string",
    "features": ["string"],
    "isActive": true,
    "popularityRating": 0, // 1-5
    "createdAt": "datetime",
    "updatedAt": "datetime"
};

const projectDataType = {
    "id": "guid",
    "title": "string",
    "description": "string",
    "status": "string", // Planning, In Progress, Completed, On Hold, Cancelled
    "priority": "string", // Low, Medium, High, Critical
    "startDate": "datetime",
    "endDate": "datetime",
    "dueDate": "datetime",
    "budget": "decimal",
    "progress": 0, // 0-100
    "tags": ["string"],
    "thumbnailUrl": "string",
    "repositoryUrl": "string",
    "liveUrl": "string",
    "isPublic": true,
    "isFeatured": false,
    "userId": "guid",
    "techStackId": "guid",
    "createdAt": "datetime",
    "updatedAt": "datetime"
};

const userDataType = {
    "id": "guid",
    "username": "string",
    "email": "string",
    "passwordHash": "string",
    "firstName": "string",
    "lastName": "string",
    "avatar": "string",
    "bio": "string",
    "website": "string",
    "location": "string",
    "role": "string", // User, Admin, Moderator
    "isEmailVerified": false,
    "emailVerifiedAt": "datetime",
    "lastLoginAt": "datetime",
    "createdAt": "datetime",
    "updatedAt": "datetime"
};

const userPreferencesDataType = {
    "id": "guid",
    "userId": "guid",
    "theme": "string", // light, dark, auto
    "language": "string", // en, es, fr, etc.
    "timezone": "string", // UTC, America/New_York, etc.
    "emailNotifications": true,
    "pushNotifications": true,
    "projectVisibility": "string", // public, private, unlisted
    "createdAt": "datetime",
    "updatedAt": "datetime"
};

const repositoryDataType = {
    "id": "guid",
    "name": "string",
    "description": "string",
    "url": "string",
    "provider": "string", // GitHub, GitLab, Bitbucket
    "language": "string",
    "stars": 0,
    "forks": 0,
    "issues": 0,
    "lastCommitAt": "datetime",
    "license": "string",
    "topics": ["string"],
    "isPrivate": false,
    "isFork": false,
    "isArchived": false,
    "size": 0, // Size in MB
    "userId": "guid",
    "projectId": "guid",
    "createdAt": "datetime",
    "updatedAt": "datetime"
};


export { techStackDataType, projectDataType, userDataType, userPreferencesDataType, repositoryDataType };
