import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: {
    userId: string;
    username: string;
    /** Nome de exibição do usuário logado (tokens antigos podem não tê-lo). */
    name?: string;
    role?: string;
    employeeId?: string;
  };
}
