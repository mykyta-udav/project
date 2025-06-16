import type { SignUpRequest, SignInRequest, SignUpResponse, SignInResponse, ApiError } from './api';

interface MockUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'CLIENT' | 'ADMIN';
  createdAt: Date;
}

let mockUsers: MockUser[] = [
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


const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));


export const mockAuthAPI = {
  signUp: async (data: SignUpRequest): Promise<SignUpResponse> => {
    console.log('🔄 Mock API: Sign up request', data);
    
    await delay();

    if (!data.firstName || !data.lastName || !data.email || !data.password) {
      throw {
        message: 'All fields are required',
        status: 400,
      } as ApiError;
    }

    const existingUser = mockUsers.find(user => user.email.toLowerCase() === data.email.toLowerCase());
    if (existingUser) {
      throw {
        message: 'A user with this email address already exists.',
        status: 409,
      } as ApiError;
    }


    const newUser: MockUser = {
      id: (mockUsers.length + 1).toString(),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      password: data.password,
      role: 'CLIENT', // Default role
      createdAt: new Date(),
    };

    mockUsers.push(newUser);

    console.log('Mock API: User registered successfully', { email: newUser.email, role: newUser.role });

    return {
      message: 'User registered successfully',
    };
  },

  signIn: async (data: SignInRequest): Promise<SignInResponse> => {
    console.log('Mock API: Sign in request', { email: data.email });

    await delay();

    if (!data.email || !data.password) {
      throw {
        message: 'Email and password are required',
        status: 400,
      } as ApiError;
    }

    const user = mockUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (!user) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      } as ApiError;
    }

    if (user.password !== data.password) {
      throw {
        message: 'Invalid email or password',
        status: 401,
      } as ApiError;
    }

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
    
  
    await delay(200);

    console.log('Mock API: User signed out successfully');
    
    // In a real API, this might invalidate the token
    // For mock, we just simulate the call
  },
};

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
