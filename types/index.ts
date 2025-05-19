import { User } from 'next-auth';

export interface Todo {
  id: number | string;
  text: string;
  completed: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  assignedTo?: string[];
  createdById: string;
  createdBy?: {
    id: string;
    name?: string;
    image?: string;
  };
  teamId?: string | null;
  deadline?: string | Date | null;
}

export interface UserWithId extends User {
  id: string;
}
