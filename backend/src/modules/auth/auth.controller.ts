import { Body, Controller, Get, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { User, UserRole } from '../../entities/user.entity';
import { AuthenticatedUser } from './strategies/jwt.strategy';
import { AuthResponse, AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

/** Typed request with the authenticated user attached by JwtAuthGuard */
interface AuthRequest {
  user: AuthenticatedUser;
}

/**
 * Exposes authentication endpoints under /api/auth.
 * Register, login, and profile retrieval.
 */
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/register
   * Creates a new user account and returns a JWT.
   */
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  /**
   * POST /api/auth/login
   * Authenticates an existing user and returns a JWT.
   */
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  /**
   * POST /api/auth/forgot-password
   * Initiates a password reset. Returns { otpRequired: boolean }.
   * When email is configured, an OTP is sent; the frontend shows the OTP step.
   * No auth required.
   */
  @Post('forgot-password')
  initiateForgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ otpRequired: boolean }> {
    return this.authService.initiateForgotPassword(dto.email);
  }

  /**
   * POST /api/auth/reset-password
   * Resets password for a user identified by email.
   * No auth required — used by the forgot-password page.
   */
  @Post('reset-password')
  resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  /**
   * GET /api/auth/me
   * Returns the authenticated user's profile (no password hash).
   * Requires a valid JWT Bearer token.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: AuthRequest): Promise<Omit<User, 'passwordHash'>> {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * PATCH /api/auth/profile
   * Updates the authenticated user's display name.
   * Requires a valid JWT Bearer token.
   */
  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: AuthRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<{ id: number; name: string; email: string; role: UserRole }> {
    return this.authService.updateProfile(req.user.id, dto);
  }

  /**
   * PATCH /api/auth/password
   * Changes the authenticated user's password after verifying the current one.
   * Requires a valid JWT Bearer token.
   */
  @Patch('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Request() req: AuthRequest,
    @Body() dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(req.user.id, dto);
  }
}
