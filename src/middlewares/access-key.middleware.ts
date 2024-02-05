import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AccessKeyMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    if (req.headers['access-key'] !== process.env.ACCESS_KEY) {
      throw new UnauthorizedException();
    }
    next();
  }
}
