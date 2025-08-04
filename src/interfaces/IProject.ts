import { IBaseEntity } from './IBaseEntity';
import { ITechStack } from './ITechStack';

export interface IProject extends IBaseEntity {
  title: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  budget?: number;
  progress: number;
  tags: string[];
  thumbnailUrl?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  userId: string;
  techStackIds: string[];
  techStacks?: ITechStack[];
  userUsername?: string;
}

export interface IProjectSummary {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  tags: string[];
  thumbnailUrl?: string;
  image?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  userUsername: string;
  techStackIds: string[];
  techStacks?: ITechStack[];
  repositoriesCount?: number;
  projectsCount?: number;
}

export interface ICreateProject {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  progress?: number;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  budget?: number;
  tags?: string[];
  thumbnailUrl?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  techStackIds?: string[];
}

export interface IUpdateProject {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  budget?: number;
  progress?: number;
  tags?: string[];
  thumbnailUrl?: string;
  repositoryUrl?: string;
  liveUrl?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
  techStackIds?: string[];
}

export interface IPaginatedProjectsResponse {
  data: IProjectSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// For admin API responses that return projects directly in data array
export interface IAdminProjectsResponse {
  data: IProjectSummary[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
