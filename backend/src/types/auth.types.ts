export type UserRole = 'customer' | 'seller' | 'admin';

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  role?: UserRole;
}

export interface AuthResult {
  user: RequestUser;
  token: string;
}
