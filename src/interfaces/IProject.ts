import { IBaseEntity } from './IBaseEntity';
import { IRepository } from './IRepository';
import { ITechStack } from './ITechStack';

export interface IProject extends IBaseEntity {
    title: string;
    state: 'Active' | 'In Progress' | 'Completed' | 'Pending';
    demoUrl: string;
    description?: string;
    imageUrl?: string;
    repository?: IRepository;
    techStacks: ITechStack[];
}
