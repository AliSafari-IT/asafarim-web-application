export interface IBaseEntity {
    id: string; // GUID
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
    updatedBy?: string;
    isActive: boolean;
    version?: number;
    metadata?: Record<string, any>;
}
