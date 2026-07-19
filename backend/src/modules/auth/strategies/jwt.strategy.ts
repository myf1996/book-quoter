import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../entities/user.entity';

/** JWT payload shape stored in the token */
interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Authenticated user attached to req.user after JWT validation */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

/**
 * Validates Bearer tokens from the Authorization header.
 * On success, attaches { id, email, role } to req.user for downstream guards and handlers.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev-secret',
    });
  }

  /**
   * Called after signature verification — return value is set as req.user.
   * @param payload - Decoded JWT payload
   */
  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
