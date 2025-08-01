import { IBaseEntity } from './IBaseEntity';

export interface IUser extends IBaseEntity {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    bio?: string;
    website?: string;
    location?: string;
    githubUsername?: string;
    linkedinProfile?: string;
    twitterHandle?: string;
    role: 'Admin' | 'User' | 'Moderator' | 'Guest';
    isActive: boolean;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    preferences?: IUserPreferences;
}

export interface IUserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectVisibility: 'public' | 'private' | 'unlisted';
}

// DTO for updating user preferences (all fields optional)
export interface IUpdateUserPreferences {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    timezone?: string;
    emailNotifications?: boolean;
    pushNotifications?: boolean;
    projectVisibility?: 'public' | 'private' | 'unlisted';
}
