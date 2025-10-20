import { Request } from 'express';

export interface JwtUser {
  userId: string;
  email: string;
  role: 'admin' | 'morador' | 'limpeza';
}

export interface AuthenticatedRequest extends Request {
  user: JwtUser;
}
