import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { PrismaService } from 'src/main/prisma/prisma.service';


@Injectable()
export class JwtAuthGuard implements CanActivate {
  // Inject both services
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService, 
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer '))
      throw new UnauthorizedException('Missing or invalid token');

    const token = authHeader.split(' ')[1];
    let payload: any;
    
    // --- 1. Basic Token Verification ---
    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const { id: userId, sessionToken } = payload; 

    // --- 2. Suspension Check ---
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    
    if (user.isSuspended) {
      // If the user is suspended, deny access immediately, regardless of active session
      throw new ForbiddenException(`Account suspended: ${user.suspensionReason || 'Contact support for details.'}`);
    }

    // --- 3. Active Session Validation (Is this session still active?) ---
    const activeSession = await this.prisma.activeSession.findFirst({
      where: {
        userId: userId,
        sessionToken: sessionToken,
      },
    });

    if (!activeSession) {
      // The session token is valid, but the active session record was deleted (e.g., by the logout method or a cleanup job)
      throw new UnauthorizedException('Session terminated. Please log in again.');
    }

    // --- 4. Session Refresh (Update Last Activity Time) ---
    await this.prisma.activeSession.update({
      where: { id: activeSession.id },
      data: { lastActivity: new Date() },
    });

    request['user'] = { ...user, sessionToken: activeSession.sessionToken };
    request['sessionId'] = activeSession.id;

    return true; 
  }
}