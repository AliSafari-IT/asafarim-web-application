export interface IPasswordReset {
    email: string;
}

export interface IPasswordResetResponse {
    success: boolean;
    message: string;
}

export interface IPasswordChange {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface IEmailVerification {
    token: string;
    email: string;
}

export interface ITwoFactorSetup {
    enable: boolean;
    backupCodes?: string[];
    qrCode?: string;
    secret?: string;
}

export interface ITwoFactorVerification {
    code: string;
    backupCode?: string;
}
