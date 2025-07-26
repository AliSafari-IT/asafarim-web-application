// Base interface
export type { IBaseEntity } from './IBaseEntity';

// Domain interfaces
export type { IProject } from './IProject';
export type { IRepository } from './IRepository';
export type { ITechStack } from './ITechStack';

// User management interfaces
export type { IUser, IUserPreferences } from './IUser';
export type { IUserRegistration, IUserRegistrationResponse } from './IUserRegistration';
export type { IUserLogin, IUserLoginResponse, IUserProfile } from './IUserAuth';
export type { 
    IUserProjectAssignment, 
    IProjectPermissions, 
    IUserProjectSetup, 
    IProjectInvitation 
} from './IUserProjects';
export type { 
    IPasswordReset, 
    IPasswordResetResponse, 
    IPasswordChange, 
    IEmailVerification, 
    ITwoFactorSetup, 
    ITwoFactorVerification 
} from './IUserSecurity';
