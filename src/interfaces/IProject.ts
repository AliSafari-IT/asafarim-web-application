import { IBaseEntity } from './IBaseEntity';

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
  techStackId?: string;
  userUsername?: string;
  techStackName?: string;
}

export interface IProjectSummary {
  [x: string]: undefined;
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  progress: number;
  tags: string[];
  thumbnailUrl?: string;
  isPublic: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  userUsername: string;
  techStackName?: string;
}

export interface ICreateProject {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
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
  techStackId?: string;
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
  techStackId?: string;
}

export interface IPaginatedProjectsResponse {
  items: IProjectSummary[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
