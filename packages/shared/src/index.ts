// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Health Check
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  database: 'connected' | 'disconnected';
  timestamp: string;
  error?: string;
}

// Hello World
export interface HelloResponse {
  message: string;
  app: string;
  version: string;
}

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  name: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
}
