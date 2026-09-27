import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

export interface JwtPayload {
  sub: string;        // user ID
  email: string;
  roleId: string;
  roleName: string;
  permissions: string[];
  iat?: number;
  exp?: number;
}

/**
 * @CurrentUser() — inject user dari JWT payload ke parameter controller.
 *
 * Contoh:
 * async getProfile(@CurrentUser() user: JwtPayload) { ... }
 * async getProfile(@CurrentUser('sub') userId: string) { ... }
 */
export const CurrentUser = createParamDecorator(
  (field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as JwtPayload;
    return field ? user?.[field] : user;
  },
);

