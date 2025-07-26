import { IBaseEntity } from './IBaseEntity';
import { IProject } from './IProject';

export interface IUserProjectAssignment extends IBaseEntity {
    userId: string;
    projectId: string;
    role: 'Owner' | 'Admin' | 'Contributor' | 'Viewer';
    permissions: IProjectPermissions;
    assignedAt: Date;
    assignedBy: string;
}

export interface IProjectPermissions {
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
    canManageSettings: boolean;
    canPublish: boolean;
}

export interface IUserProjectSetup {
    userId: string;
    project: Omit<IProject, keyof IBaseEntity>;
    initialRole: 'Owner';
    makePublic: boolean;
    inviteCollaborators?: IProjectInvitation[];
}

export interface IProjectInvitation {
    email: string;
    role: 'Admin' | 'Contributor' | 'Viewer';
    message?: string;
    expiresAt?: Date;
}
