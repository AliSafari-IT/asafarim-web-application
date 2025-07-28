import { techStackDataType, projectDataType, userDataType, userPreferencesDataType, repositoryDataType } from "./data.js";
import { v4 as uuidv4 } from "uuid";
import fetch from "node-fetch";

// Configuration
const API_BASE_URL = "http://localhost:5242/api";
const ADMIN_CREDENTIALS = {
    email: "ali@asafarim.com",
    password: "Ali+123456",
    username: "ali",
    firstName: "Ali",
    lastName: "Safari",
    bio: "Full Stack Developer with a passion for building scalable web applications.",
    website: "https://asafarim.com",
    location: "Belgium",
    isAdmin: true,
    isActive: true,
    isEmailVerified: true,
    avatar: "https://asafarim.com/ali_profile-B31cYQRH.jpg",
    socialLinks: {
        github: "https://github.com/AliSafari-IT"
    },
    preferences: {
        theme: "dark",
    },
    token: null,
    role: "Admin"
};

const MY_REPOS_URL = "https://api.github.com/users/AliSafari-IT/repos";

const getRepositoryUrlFromGithubUser = async () => {
    try {
        const response = await fetch(MY_REPOS_URL);
        const repositories = await response.json();
        if (!Array.isArray(repositories) || repositories.length === 0) {
            console.warn('No repositories found or invalid response from GitHub API');
            return 'https://github.com/AliSafari-IT';
        }
        const randomRepo = repositories[Math.floor(Math.random() * repositories.length)];
        return randomRepo.html_url || 'https://github.com/AliSafari-IT';
    } catch (error) {
        console.error('Error fetching GitHub repositories:', error.message);
        return 'https://github.com/AliSafari-IT';
    }
}

const techStackNames = [
    "React",
    "Angular",
    "Vue.js",
    "Node.js",
    "Express.js",
    "Next.js",
    "Nuxt.js",
    "TypeScript",
    "JavaScript",
    "Python",
    "Django",
    "Flask",
    "FastAPI",  
    "ASP.NET Core",
    "Spring Boot",
    "Laravel",
    "Ruby on Rails",
    "PostgreSQL",
    "MongoDB",
    "Redis"
];
// Sample data generators
const generateTechStackData = () => {
    const techStack = techStackNames[Math.floor(Math.random() * techStackNames.length)];
    const categories = {
        "React": "Frontend", "Angular": "Frontend", "Vue.js": "Frontend",
        "Node.js": "Backend", "Express.js": "Backend", "Next.js": "Frontend", "Nuxt.js": "Frontend",
        "TypeScript": "Frontend", "JavaScript": "Frontend",
        "Python": "Backend", "Django": "Backend", "Flask": "Backend", "FastAPI": "Backend",
        "ASP.NET Core": "Backend", "Spring Boot": "Backend", "Laravel": "Backend", "Ruby on Rails": "Backend",
        "PostgreSQL": "Database", "MongoDB": "Database", "Redis": "Database"
    };
    
    const descriptions = {
        "React": "A JavaScript library for building user interfaces",
        "Angular": "A platform for building mobile and desktop web applications",
        "Vue.js": "The progressive JavaScript framework",
        "Node.js": "JavaScript runtime built on Chrome's V8 JavaScript engine",
        "Express.js": "Fast, unopinionated, minimalist web framework for Node.js",
        "Next.js": "The React framework for production",
        "Nuxt.js": "The intuitive Vue framework",
        "TypeScript": "JavaScript with syntax for types",
        "JavaScript": "High-level, interpreted programming language",
        "Python": "High-level programming language for general-purpose programming",
        "Django": "High-level Python web framework",
        "Flask": "Lightweight WSGI web application framework",
        "FastAPI": "Modern, fast web framework for building APIs with Python",
        "ASP.NET Core": "Cross-platform, high-performance framework for building modern applications",
        "Spring Boot": "Java-based framework for creating microservices",
        "Laravel": "PHP web application framework with expressive, elegant syntax",
        "Ruby on Rails": "Server-side web application framework written in Ruby",
        "PostgreSQL": "Advanced open source relational database",
        "MongoDB": "Document-oriented NoSQL database",
        "Redis": "In-memory data structure store"
    };
    
    return {
        name: techStack,
        description: descriptions[techStack] || `A powerful ${techStack} technology stack`,
        category: categories[techStack] || "Backend",
        techVersion: `${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}.0`,
        iconUrl: `https://via.placeholder.com/64x64?text=${techStack.replace(/[^a-zA-Z]/g, '')}`,
        documentationUrl: `https://docs.${techStack.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        officialWebsite: `https://${techStack.toLowerCase().replace(/[^a-z]/g, '')}.com`,
        features: [`${techStack} Feature 1`, `${techStack} Feature 2`, `High Performance`, `Scalable`],
        isActive: Math.random() > 0.1,
        popularityRating: Math.floor(Math.random() * 5) + 1
    };
};

const generateUserData = () => {
    const username = `user_${Math.random().toString(36).substring(7)}`;
    return {
        username,
        email: `${username}@example.com`,
        password: "User123!",
        firstName: `FirstName${Math.floor(Math.random() * 1000)}`,
        lastName: `LastName${Math.floor(Math.random() * 1000)}`,
        bio: `Bio for ${username}`,
        website: `https://${username}.example.com`,
        location: ["New York", "London", "Tokyo", "Berlin", "Sydney"][Math.floor(Math.random() * 5)]
    };
};

const generateProjectData = async (userId, techStackId) => {
    const repoUrl = await getRepositoryUrlFromGithubUser();
    return {
        title: `Project ${Math.random().toString(36).substring(7)}`,
        description: `An amazing project that does incredible things`,
        status: ["Planning", "In Progress", "Completed", "On Hold"][Math.floor(Math.random() * 4)],
        priority: ["Low", "Medium", "High", "Critical"][Math.floor(Math.random() * 4)],
        startDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        dueDate: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        budget: Math.floor(Math.random() * 100000),
        progress: Math.floor(Math.random() * 101),
        tags: [`tag${Math.floor(Math.random() * 100)}`, `tag${Math.floor(Math.random() * 100)}`],
        thumbnailUrl: `https://picsum.photos/600/400.jpg`,
        repositoryUrl: repoUrl,
        liveUrl: `https://project-${Math.random().toString(36).substring(7)}.vercel.app`,
        isPublic: Math.random() > 0.3,
        isFeatured: Math.random() > 0.8,
        userId: userId,
        techStackId: techStackId
    };
};

const generateRepositoryData = (userId) => ({
    name: `Repository-${Math.random().toString(36).substring(7)}`,
    description: `A repository for storing code and documentation`,
    url: `https://github.com/user/repo-${Math.random().toString(36).substring(7)}`,
    provider: "GitHub",
    language: ["JavaScript", "TypeScript", "Python", "C#", "Java"][Math.floor(Math.random() * 5)],
    stars: Math.floor(Math.random() * 1000),
    forks: Math.floor(Math.random() * 100),
    issues: Math.floor(Math.random() * 50),
    lastCommitAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    license: ["MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", null][Math.floor(Math.random() * 5)],
    topics: [`topic${Math.floor(Math.random() * 100)}`, `topic${Math.floor(Math.random() * 100)}`],
    isPrivate: Math.random() > 0.7,
    isFork: Math.random() > 0.8,
    isArchived: Math.random() > 0.9,
    size: Math.round(Math.random() * 1000 * 10) / 10, // Size in MB
    userId: userId
});

const generateUserPreferenceData = (user) => ({
    userId: user.id,
    theme: ["light", "dark", "auto"][Math.floor(Math.random() * 3)],
    language: ["en", "es", "fr", "de", "ja"][Math.floor(Math.random() * 5)],
    timezone: ["UTC", "EST", "PST", "GMT", "JST"][Math.floor(Math.random() * 5)],
    emailNotifications: Math.random() > 0.3,
    pushNotifications: Math.random() > 0.5,
    marketingEmails: Math.random() > 0.7,
    twoFactorEnabled: Math.random() > 0.8
});

// API Helper functions
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const config = {
        method,
        headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const result = await response.json();
        
        if (!response.ok) {
            console.error(`API Error (${response.status}):`, result);
            return null;
        }
        
        return result;
    } catch (error) {
        console.error(`Network Error:`, error.message);
        return null;
    }
};

// Authentication
const getAuthToken = async () => {
    console.log('🔐 Authenticating admin user...');
    
    // Try to register admin first (in case it doesn't exist)
    const registerResult = await apiCall('/auth/register', 'POST', {
        username: ADMIN_CREDENTIALS.username,
        email: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password,
        confirmPassword: ADMIN_CREDENTIALS.password,
        firstName: 'Admin',
        lastName: 'User'
    });
    
    // Login to get token
    const loginResult = await apiCall('/auth/login', 'POST', {
        emailOrUsername: ADMIN_CREDENTIALS.email,
        password: ADMIN_CREDENTIALS.password
    });
    
    if (loginResult && loginResult.success && loginResult.data) {
        console.log('✅ Authentication successful');
        return loginResult.data.token;
    }
    
    console.error('❌ Authentication failed');
    return null;
};

// Population functions
const populateUsers = async (token, count = 10) => {
    console.log(`👥 Creating ${count} users...`);
    const createdUsers = [];
    
    for (let i = 0; i < count; i++) {
        try {
            const userData = generateUserData();
            console.log(`🔄 Creating user ${i + 1}/${count}: ${userData.username}`);
            
            const userRegistrationData = {
                ...userData,
                confirmPassword: userData.password
            };
            const result = await apiCall('/auth/register', 'POST', userRegistrationData);
            
            if (result && result.success && result.data && result.data.user) {
                createdUsers.push(result.data.user);
                console.log(`✅ Created user: ${userData.username}`);
            } else {
                console.log(`❌ Failed to create user: ${userData.username}`);
                console.log('API Response:', result);
            }
            
            // Increased delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`❌ Error creating user ${i + 1}:`, error.message);
        }
    }
    
    console.log(`👥 Created ${createdUsers.length} out of ${count} users`);
    return createdUsers;
};

const populateTechStacks = async (token, count = 20) => {
    console.log(`🚀 Creating ${count} techStacks...`);
    const createdTechStacks = [];
    
    for (let i = 0; i < count; i++) {
        try {
            const techStackData = generateTechStackData();
            console.log(`🔄 Creating techStack ${i + 1}/${count}: ${techStackData.name}`);
            
            const result = await apiCall('/TechStacks', 'POST', techStackData, token);
            
            if (result && result.success && result.data) {
                createdTechStacks.push(result.data);
                console.log(`✅ Created techStack: ${techStackData.name}`);
            } else {
                console.log(`❌ Failed to create techStack: ${techStackData.name}`);
                console.log('API Response:', result);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        } catch (error) {
            console.error(`❌ Error creating techStack ${i + 1}:`, error.message);
        }
    }
    
    console.log(`🚀 Created ${createdTechStacks.length} out of ${count} techStacks`);
    return createdTechStacks;
};

const populateRepositories = async (token, users, count = 20) => {
    console.log(`🌐 Creating ${count} repositories...`);
    const createdRepositories = [];
    
    if (!users || users.length === 0) {
        console.error('❌ No users available to assign repositories to');
        return [];
    }
    
    for (let i = 0; i < count; i++) {
        try {
            // Assign repository to a random user
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (!randomUser || !randomUser.id) {
                console.error('❌ Invalid user data for repository:', randomUser);
                continue;
            }
            
            const repositoryData = generateRepositoryData(randomUser.id);
            console.log(`🔄 Creating repository ${i + 1}/${count}: ${repositoryData.name}`);
            
            const result = await apiCall('/Repositories', 'POST', repositoryData, token);
            
            if (result && result.success && result.data) {
                createdRepositories.push(result.data);
                console.log(`✅ Created repository: ${repositoryData.name}`);
            } else {
                console.log(`❌ Failed to create repository: ${repositoryData.name}`);
                console.log('API Response:', result);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        } catch (error) {
            console.error(`❌ Error creating repository ${i + 1}:`, error.message);
        }
    }
    
    console.log(`🌐 Created ${createdRepositories.length} out of ${count} repositories`);
    return createdRepositories;
};

const populateUserPreferences = async (token, users, count = 20) => {
    console.log(`👤 Creating ${count} userPreferences...`);
    const createdUserPreferences = [];
    
    for (let i = 0; i < count && i < users.length; i++) {
        try {
            const user = users[i];
            if (!user || !user.id) {
                console.error('❌ Invalid user data for userPreference:', user);
                continue;
            }
            
            const userPreferenceData = generateUserPreferenceData(user);
            console.log(`🔄 Creating userPreference ${i + 1}/${count}: ${userPreferenceData.userId}`);
            
            const result = await apiCall('/UserPreferences', 'POST', userPreferenceData, token);
            
            if (result && result.success && result.data) {
                createdUserPreferences.push(result.data);
                console.log(`✅ Created userPreference: ${userPreferenceData.userId}`);
            } else {
                console.log(`❌ Failed to create userPreference: ${userPreferenceData.userId}`);
                console.log('API Response:', result);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        } catch (error) {
            console.error(`❌ Error creating userPreference ${i + 1}:`, error.message);
        }
    }
    
    console.log(`👤 Created ${createdUserPreferences.length} out of ${count} userPreferences`);
    return createdUserPreferences;
};

const populateProjects = async (token, users, count = 20) => {
    console.log(`📁 Creating ${count} projects...`);
    const createdProjects = [];
    
    if (!users || users.length === 0) {
        console.error('❌ No users available to assign projects to');
        return [];
    }
    
    for (let i = 0; i < count; i++) {
        try {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            if (!randomUser || !randomUser.id) {
                console.error('❌ Invalid user data:', randomUser);
                continue;
            }
            
            console.log(`🔄 Generating project ${i + 1}/${count}...`);
            const projectData = await generateProjectData(randomUser.id, null);
            
            console.log(`📤 Creating project: ${projectData.title}`);
            const result = await apiCall('/projects', 'POST', projectData, token);
            
            if (result && result.success) {
                createdProjects.push(result.data);
                console.log(`✅ Created project: ${projectData.title}`);
            } else {
                console.log(`❌ Failed to create project: ${projectData.title}`);
                console.log('API Response:', result);
            }
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Increased delay
        } catch (error) {
            console.error(`❌ Error creating project ${i + 1}:`, error.message);
        }
    }
    
    return createdProjects;
};

// Main population function
const populateDb = async () => {
    console.log('🚀 Starting database population...');
    console.log(`📡 API Base URL: ${API_BASE_URL}`);
    
    try {
        // Step 1: Get authentication token
        const token = await getAuthToken();
        if (!token) {
            console.error('❌ Cannot proceed without authentication token');
            return;
        }
        
        // Step 2: Create users
        const users = await populateUsers(token, 15);
        console.log(`👥 Created ${users.length} users`);

        // Step 3: Create techStacks
        const techStacks = await populateTechStacks(token, 10);
        console.log(`🚀 Created ${techStacks.length} techStacks`);

        // Step 4: Create repositories
        const repositories = await populateRepositories(token, users, 15);
        console.log(`🌐 Created ${repositories.length} repositories`);

        // Step 5: Create userPreferences
        const userPreferences = await populateUserPreferences(token, users, users.length);
        console.log(`👤 Created ${userPreferences.length} userPreferences`);
        
        // Step 6: Create projects
        let projects = [];
        if (users.length > 0) {
            projects = await populateProjects(token, users, 25);
            console.log(`📁 Created ${projects.length} projects`);
        }
        
        console.log('🎉 Database population completed!');
        console.log('📊 Summary:');
        console.log(`   - Users: ${users.length}`);
        console.log(`   - TechStacks: ${techStacks.length}`);
        console.log(`   - Repositories: ${repositories.length}`);
        console.log(`   - UserPreferences: ${userPreferences.length}`);
        console.log(`   - Projects: ${projects.length}`);
        
    } catch (error) {
        console.error('💥 Population failed:', error.message);
    }
};

// Run the population
console.log('🔄 Starting script execution...');
populateDb()
    .then(() => console.log('🏁 Script finished'))
    .catch(err => {
        console.error('❌ Script failed:', err);
        process.exit(1);
    });

// Export for testing purposes
export { populateDb, generateUserData, generateProjectData, generateTechStackData };