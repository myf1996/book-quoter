import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../../../entities/user.entity';

/** JWT payload shape stored in the token */
interface JwtPayload {
  sub: number;
  email: string;
  role: UserRole;
}

/** Authenticated user attached to req.user after JWT validation */
export interface AuthenticatedUser {
  id: number;
  email: string;
  role: UserRole;
}

/**
 * Validates Bearer tokens from the Authorization header.
 * On success, attaches { id, email, role } to req.user for downstream guards and handlers.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'dev-secret',
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
