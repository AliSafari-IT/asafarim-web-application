export interface IUserRegistration {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    agreeToTerms: boolean;
    subscribeToNewsletter?: boolean;
    referralCode?: string;
}

export interface IUserRegistrationResponse {
    success: boolean;
    message: string;
    userId?: string;
    verificationToken?: string;
    errors?: Record<string, string[]>;
}
