export interface IApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    timestamp: Date;
    statusCode: number;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface IApiError {
    field?: string;
    message: string;
    code?: string;
}

export interface IValidationError {
    field: string;
    messages: string[];
}
