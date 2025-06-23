import type { LoginCredentials, RegisterCredentials, AuthResponse, User } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { realAuthService } from './api';

const USE_MOCK_API =
  import.meta.env.VITE_USE_MOCK_API === 'true' || import.meta.env.MODE === 'development';

interface MockUser extends User {
  password: string;
}

// IMPORTANT: This waiter email list is used for MOCK API only
// In production, the backend should handle role assignment based on its own waiter email list
const WAITER_EMAILS = [
  'waiter@restaurant.com',
  'staff@restaurant.com',
  'jane.waiter@restaurant.com',
  'service@restaurant.com',
  'waitstaff@restaurant.com',
  'server@restaurant.com',
  'dining.staff@restaurant.com',
];

const mockUsers: MockUser[] = [
  {
    username: 'John Customer',
    email: 'customer@restaurant.com',
    password: 'password123',
    role: UserRole.CUSTOMER,
  },
  {
    username: 'Jane Waiter',
    email: 'waiter@restaurant.com',
    password: 'password123',
    role: UserRole.WAITER,
  },
  // Removed visitor mock user - visitors are unauthorized users only
];

const generateMockToken = (user: User): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      sub: user.email, // Use email as subject
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
      iat: Math.floor(Date.now() / 1000),
    })
  );
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const removePassword = (user: MockUser): User => {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
  };
};

const checkWaiterEmail = (email: string): boolean => {
  return WAITER_EMAILS.includes(email.toLowerCase());
};

// NOTE: This role assignment is for MOCK API only
// In production, the backend handles role assignment based on its own validation
const assignRole = (email: string): UserRole => {
  if (checkWaiterEmail(email)) {
    return UserRole.WAITER;
  }
  // All new registered users get Customer role by default in mock
  // In production, this is handled by the backend
  return UserRole.CUSTOMER;
};

const mockAuthService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    await delay();

    const user = mockUsers.find((u) => u.email === credentials.email);
    if (!user || user.password !== credentials.password) {
      throw new Error('Invalid email or password');
    }

    const userWithoutPassword = removePassword(user);
    const token = generateMockToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    await delay();

    const existingUser = mockUsers.find((u) => u.email === credentials.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Mock role assignment - in production, this is handled by the backend
    const assignedRole = assignRole(credentials.email);
    const newUser: MockUser = {
      username: credentials.username,
      email: credentials.email,
      password: credentials.password,
      role: assignedRole,
    };

    mockUsers.push(newUser);

    const userWithoutPassword = removePassword(newUser);
    const token = generateMockToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  },

  logout: async (): Promise<void> => {
    await delay(200);
    // In a real implementation, this would invalidate the token on the server
  },
};

export const authService = USE_MOCK_API ? mockAuthService : realAuthService;

export const mockAuthServiceExplicit = mockAuthService;

export const getWaiterEmails = (): string[] => WAITER_EMAILS;
