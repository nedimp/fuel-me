// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Health Check
export interface HealthResponse {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected";
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

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
  role?: "user" | "admin";
}

export interface LoginDto {
  email: string;
  password: string;
  expectedRole?: "user" | "admin";
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  message: string;
}

// Order types
export type FuelType = "Diesel" | "Unleaded";
export type UrgencyLevel = "Standard" | "High" | "Critical";

export interface Order {
  id: string;
  userId: string;
  fuelType: FuelType;
  gallons: number;
  urgencyLevel: UrgencyLevel;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface CreateOrderDto {
  fuelType: FuelType;
  gallons: number;
  urgencyLevel: UrgencyLevel;
}
