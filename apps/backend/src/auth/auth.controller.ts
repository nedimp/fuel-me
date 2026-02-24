import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Headers,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import type { RegisterDto, LoginDto, AuthResponse, AuthUser } from "shared";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Get("me")
  async getCurrentUser(
    @Headers("authorization") authorization?: string,
  ): Promise<AuthUser> {
    if (!authorization) {
      throw new UnauthorizedException("No authorization header");
    }

    const token = authorization.replace("Bearer ", "");
    const decoded = this.authService.verifyToken(token);
    const user = await this.authService.getUserById(decoded.id);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return user;
  }
}
