import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieService } from 'src/auth/cookie.service';

@Injectable()
export class NoTokensGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const cookies = context.switchToHttp().getRequest().cookies;

    Object.keys(CookieService.tokenKeys).forEach((tokenTypeKey) => {
      const token = cookies[CookieService.tokenKeys[tokenTypeKey]];
      if (token && tokenTypeKey !== 'auth') {
        throw new UnauthorizedException({ type: 'authorized' });
      }
    });

    return true;
  }
}
