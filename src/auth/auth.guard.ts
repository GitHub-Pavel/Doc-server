import { CanActivate, ExecutionContext, Inject, mixin } from '@nestjs/common';
import { TokensService } from 'src/tokens/tokens.service';

export const AuthGuard = (tokenType: 'access' | 'refresh' | 'auth') => {
  class AuthGuardClass implements CanActivate {
    constructor(@Inject(TokensService) readonly tokensService: TokensService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = await this.tokensService.validateToken(request, tokenType);
      if (token) return true;
      return false;
    }
  }
  return mixin(AuthGuardClass);
};
