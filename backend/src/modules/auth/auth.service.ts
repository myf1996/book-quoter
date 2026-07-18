import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../entities/user.entity';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

/** Shape returned by register and login endpoints */
export interface AuthResponse {
  accessToken: string;
  user: { id: number; name: string; email: string; role: UserRole };
}

/**
 * Handles user registration, login, and profile retrieval.
 * Issues signed JWT tokens valid for 7 days.
 */
@Injectable()
export class AuthService {
  private readonly otpStore = new Map<string, { otp: string; expiresAt: Date }>();

  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  /**
   * Registers a new user and returns a JWT access token.
   * @param dto - Validated registration data (email + password)
   * @returns Access token and basic user info
   * @throws ConflictException if the email is already registered
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ name: dto.name, email: dto.email, passwordHash });
    const saved = await this.userRepo.save(user);

    const accessToken = this.signToken(saved);
    return { accessToken, user: { id: saved.id, name: saved.name, email: saved.email, role: saved.role } };
  }

  /**
   * Authenticates an existing user and returns a JWT access token.
   * @param dto - Validated login credentials (email + password)
   * @returns Access token and basic user info
   * @throws UnauthorizedException if credentials are invalid
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.signToken(user);
    return { accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  /**
   * Fetches the authenticated user's profile, omitting the password hash.
   * @param userId - The authenticated user's ID from the JWT payload
   * @returns User entity without passwordHash
   * @throws NotFoundException if no matching user exists
   */
  async getProfile(userId: number): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _omit, ...profile } = user;
    return profile;
  }

  /**
   * Updates the user's display name.
   * @param userId - The authenticated user's ID from the JWT payload
   * @param dto - Validated update data containing the new name
   * @returns Updated user object with id, name, and email
   * @throws NotFoundException if user not found
   */
  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ): Promise<{ id: number; name: string; email: string; role: UserRole }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.name = dto.name;
    const saved = await this.userRepo.save(user);
    return { id: saved.id, name: saved.name, email: saved.email, role: saved.role };
  }

  /**
   * Changes password after verifying the current one.
   * @param userId - The authenticated user's ID from the JWT payload
   * @param dto - Validated DTO containing currentPassword and newPassword
   * @returns Success message object
   * @throws NotFoundException if user not found
   * @throws UnauthorizedException if currentPassword is wrong
   */
  async changePassword(
    userId: number,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatches = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    return { message: 'Password updated successfully' };
  }

  /**
   * Initiates a password reset. When EMAIL_CONFIGURED=true, generates and sends a 6-digit OTP.
   * When email is not configured, skips OTP entirely.
   * @param email - The user's registered email address
   * @returns { otpRequired } — true when OTP was sent, false otherwise
   * @throws NotFoundException if no user exists with that email
   */
  async initiateForgotPassword(email: string): Promise<{ otpRequired: boolean }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('No account found with that email address');
    }

    const emailConfigured = process.env['EMAIL_CONFIGURED'] === 'true';

    if (emailConfigured) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      this.otpStore.set(email, { otp, expiresAt });
      // TODO: send OTP via email service
      return { otpRequired: true };
    }

    return { otpRequired: false };
  }

  /**
   * Resets a user's password. When EMAIL_CONFIGURED=true, validates the OTP first.
   * @param dto - Validated DTO containing the user's email, new password, and optional OTP
   * @returns Success message object
   * @throws NotFoundException if no account exists for the given email
   * @throws BadRequestException if OTP is required but not provided
   * @throws UnauthorizedException if OTP is invalid or expired
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('No account found with that email address');
    }

    const emailConfigured = process.env['EMAIL_CONFIGURED'] === 'true';

    if (emailConfigured) {
      if (!dto.otp) {
        throw new BadRequestException('OTP is required');
      }
      const stored = this.otpStore.get(dto.email);
      if (!stored || stored.otp !== dto.otp || new Date() > stored.expiresAt) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }
      this.otpStore.delete(dto.email);
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepo.save(user);
    return { message: 'Password reset successfully' };
  }

  /** Signs a JWT with sub + email + role claims, 7-day expiry */
  private signToken(user: User): string {
    return this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
  }
}
