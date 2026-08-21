// src/auth/optional-jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Same as JwtAuthGuard but never rejects the request. When a valid bearer token
 * is present `req.user` is populated, otherwise the handler simply gets nothing.
 * Used by endpoints that work for both logged in users and guests.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    return user || null;
  }
}
