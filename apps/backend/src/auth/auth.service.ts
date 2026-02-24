import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../prisma.service";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import type { AuthUser, RegisterDto, LoginDto, AuthResponse } from "shared";

@Injectable()
export class AuthService {
  private readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key-change-in-production";
  private readonly JWT_EXPIRES_IN = "7d";

  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: dto.role || "user",
      },
    });

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toAuthUser(user),
      token,
      message: "Registration successful",
    };
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Validate role if expectedRole is provided
    if (dto.expectedRole && user.role !== dto.expectedRole) {
      throw new UnauthorizedException(
        `This account is not authorized for ${dto.expectedRole} access`
      );
    }

    // Generate token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.toAuthUser(user),
      token,
      message: "Login successful",
    };
  }

  async getUserById(id: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toAuthUser(user) : null;
  }

  verifyToken(token: string): { id: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as {
        id: string;
        email: string;
      };
      return decoded;
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  private generateToken(id: string, email: string): string {
    return jwt.sign({ id, email }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }): AuthUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
