import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guard that rejects requests without a valid JWT Bearer token */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
