import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
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

    if (!requestSecret || requestSecret !== adminSecret) {
      throw new UnauthorizedException('Invalid or missing admin secret.');
    }

    return true;
  }
}
