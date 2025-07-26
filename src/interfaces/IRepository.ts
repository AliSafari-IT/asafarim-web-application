import { IBaseEntity } from './IBaseEntity';

export interface IRepository extends IBaseEntity {
    url: string;
    name: string;
    description: string;
    branch?: string;
    stars?: number;
    forks?: number;
    language?: string;
    lastUpdated?: Date;
    isPrivate?: boolean;
}
