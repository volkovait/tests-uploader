import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class UploadSecretGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const secret = this.config.get<string>('ADMIN_UPLOAD_SECRET');
    if (!secret || secret.length === 0) {
      throw new ForbiddenException(
        'Upload is disabled: set ADMIN_UPLOAD_SECRET on the API',
      );
    }
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['x-upload-secret'];
    const value = Array.isArray(header) ? header[0] : header;
    if (value !== secret) {
      throw new UnauthorizedException('Invalid or missing X-Upload-Secret');
    }
    return true;
  }
}
