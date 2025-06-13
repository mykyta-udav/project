import type { SignUpRequest, SignInRequest, SignUpResponse, SignInResponse, ApiError } from './api';

// Mock user storage 
interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: Date;
}

// In-memory storage for mock users
let mockUsers: MockUser[] = [
  // Pre-seeded admin user for testing
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@restaurant.com',
    password: 'admin123',
    role: 'ADMIN',
    createdAt: new Date(),
  },
  // Pre-seeded client user for testing
  {
    id: '2',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'CLIENT',
    createdAt: new Date(),
  },
];

// Helper function to generate mock JWT token
const generateMockToken = (user: MockUser): string => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 24 hours
    iat: Math.floor(Date.now() / 1000),
    jti: Math.random().toString(36).substr(2, 9),
  }));
  const signature = btoa('mock-signature');
  return `${header}.${payload}.${signature}`;
};

// Helper function to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const mockAuthAPI = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    console.log('🔄 Mock API: Sign up request', data);
    
    // Simulate network delay
    await delay();

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.email || !data.password) {
      throw {
        message: 'All fields are required',
        status: 400,
      } as ApiError;
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw {
        message: 'A user with this email address already exists.',
        status: 409,
      } as ApiError;
    }

    // Create new user
    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      role: 'CLIENT', // Default role
      createdAt: new Date(),
    };

    // Add to mock storage
    mockUsers.push(newUser);

    console.log('Mock API: User registered successfully', { email: newUser.email, role: newUser.role });

    return {
      message: 'User registered successfully',
    };
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    console.log('Mock API: Sign in request', { email: data.email });
    
    // Simulate network delay
    await delay();

    // Validate required fields
    if (!data.email || !data.password) {
      throw {
        message: 'Email and password are required',
        status: 400,
      } as ApiError;
    }

    // Find user by email
    const user = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      } as ApiError;
    }

    // Check password
    if (user.password !== data.password) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      } as ApiError;
    }

    // Generate token
    const accessToken = generateMockToken(user);

    console.log(' Mock API: User signed in successfully', { 
      email: user.email, 
      role: user.role,
      username: `${user.firstName} ${user.lastName}`
    });

    return {
      accessToken,
      username: `${user.firstName} ${user.lastName}`,
      role: user.role,
    };
  },

  signOut: async (): Promise<void> => {
    console.log('Mock API: Sign out request');
    
    // Simulate network delay
    await delay(200);

    console.log('Mock API: User signed out successfully');
    
    // In a real API, this might invalidate the token
    // For mock, we just simulate the call
  },
};

// Helper function to get all mock users (for debugging)
export const getMockUsers = () => {
  return mockUsers.map(user => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  }));
};

// Helper function to reset mock data
export const resetMockData = () => {
  mockUsers = [
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@restaurant.com',
      password: 'admin123',
      role: 'ADMIN',
      createdAt: new Date(),
    },
    {
      id: '2',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'CLIENT',
      createdAt: new Date(),
    },
  ];
}; 