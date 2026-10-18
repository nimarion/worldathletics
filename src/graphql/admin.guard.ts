import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { timingSafeEqual } from 'crypto';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const adminSecret = process.env.ADMIN_SECRET;

    if (!adminSecret) {
      this.logger.warn(
        'ADMIN_SECRET environment variable is not defined. Requests to admin endpoints will be rejected for security.',
      );
      throw new UnauthorizedException(
        'Admin secret is not configured on the server.',
      );
    }

    const requestSecret = request.headers['x-admin-secret'];

    if (typeof requestSecret !== 'string') {
      throw new UnauthorizedException('Invalid or missing admin secret.');
    }

    const secretBuffer = Buffer.from(adminSecret);
    const requestBuffer = Buffer.from(requestSecret);

    if (
      secretBuffer.length !== requestBuffer.length ||
      !timingSafeEqual(secretBuffer, requestBuffer)
    ) {
      throw new UnauthorizedException('Invalid or missing admin secret.');
    }

    return true;
  }
}
