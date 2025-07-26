export interface IUserLogin {
    emailOrUsername: string;
    password: string;
    rememberMe: boolean;
    twoFactorCode?: string;
}

export interface IUserLoginResponse {
    success: boolean;
    message: string;
    accessToken?: string;
    refreshToken?: string;
    user?: IUserProfile;
    expiresIn?: number;
    requiresTwoFactor?: boolean;
    errors?: Record<string, string[]>;
}

export interface IUserProfile {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    avatar?: string;
    role: string;
    isEmailVerified: boolean;
    lastLoginAt?: Date;
    memberSince: Date;
}
