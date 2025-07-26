import { IBaseEntity } from './IBaseEntity';
import { IUserLogin, IUserLoginResponse, IUserProfile } from './IUserAuth';
import { IUserRegistration, IUserRegistrationResponse } from './IUserRegistration';

export interface IUserSession extends IBaseEntity {
    userId: string;
    accessToken: string;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
    lastActivityAt: Date;
    isActive: boolean;
}

export interface IAuthContext {
    user: IUserProfile | null;
    session: IUserSession | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: IUserLogin) => Promise<IUserLoginResponse>;
    logout: () => Promise<void>;
    register: (data: IUserRegistration) => Promise<IUserRegistrationResponse>;
    refreshToken: () => Promise<boolean>;
}

export interface IUserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    projectVisibility: 'public' | 'private' | 'unlisted';
    dashboardLayout?: 'grid' | 'list';
    itemsPerPage?: number;
}
