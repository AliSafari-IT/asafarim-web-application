import { IProject } from './IProject';
import { ITechStack } from './ITechStack';
import { IRepository } from './IRepository';

export interface IProjectCreationRequest {
    title: string;
    description?: string;
    state: 'Active' | 'In Progress' | 'Completed' | 'Pending';
    demoUrl: string;
    imageUrl?: string;
    techStacks: ITechStack[];
    repository?: IRepository;
    isPublic: boolean;
    tags?: string[];
}

export interface IProjectCreationResponse {
    success: boolean;
    message: string;
    project?: IProject;
    errors?: Record<string, string[]>;
}

export interface IProjectUpdateRequest extends Partial<IProjectCreationRequest> {
    id: string;
}

export interface IUserProjectsList {
    projects: IProject[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}
