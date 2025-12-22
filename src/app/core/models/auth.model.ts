/**
 * Authentication Models
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    designation: string;
    img?: string;
  };
}

export interface AuthToken {
  token: string;
  expiresAt: number;
}
