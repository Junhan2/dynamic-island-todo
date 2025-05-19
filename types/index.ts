import { User } from 'next-auth';

export interface Todo {
  id: number | string
  text: string
  completed: boolean
  assignedTo?: string[]
  createdBy: string
  deadline?: string | Date | null
}

export interface UserWithId extends User {
  id: string
}
