import { IProject } from './IProject';
import { IUserProfile } from './IUserAuth';

export interface IDashboardState {
    user: IUserProfile | null;
    projects: IProject[];
    activeTab: 'project-overview' | 'public-packages' | 'topics';
    isLoading: boolean;
    error: string | null;
    filters: IProjectFilter;
    stats: IDashboardStats;
}

export interface IProjectFilter {
    state?: 'Active' | 'In Progress' | 'Completed' | 'Pending' | 'All';
    techStack?: string;
    tags?: string[];
    searchTerm?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt' | 'state';
    sortDirection?: 'asc' | 'desc';
    page?: number;
    pageSize?: number;
}

export interface IDashboardStats {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    inProgressProjects: number;
    pendingProjects: number;
    totalTechStacks: number;
    favoriteLanguages: Array<{
        name: string;
        count: number;
        percentage: number;
    }>;
}

export interface IProjectFormData {
    title: string;
    description: string;
    state: 'Active' | 'In Progress' | 'Completed' | 'Pending';
    demoUrl: string;
    imageUrl: string;
    techStacks: string[];
    repositoryUrl: string;
    repositoryName: string;
    isPublic: boolean;
    tags: string[];
}

export interface IProjectValidationErrors {
    title?: string;
    description?: string;
    demoUrl?: string;
    techStacks?: string;
    repositoryUrl?: string;
}
