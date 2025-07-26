import { IBaseEntity } from './IBaseEntity';

export interface ITechStack extends IBaseEntity {
    name: string;
    category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Mobile' | 'Language' | 'Framework' | 'Library' | 'Tool' | 'Cloud';
    techVersion?: string; // Renamed from 'version' to avoid conflict with IBaseEntity.version
    icon?: string;
    color?: string;
    url?: string;
    description?: string;
    proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}
