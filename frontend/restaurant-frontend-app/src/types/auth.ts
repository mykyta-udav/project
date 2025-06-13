export interface User {
  username: string;
  role: 'CLIENT';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
} 