export type UserRole = 'patient' | 'nurse' | 'doctor' | 'admin';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface RegisterRequest {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  password: string;
}
