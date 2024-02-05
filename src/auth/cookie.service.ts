import { Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class CookieService {
  static tokenKeys = {
    refresh: 'refresh-token',
    access: 'access-token',
    auth: 'auth-token',
  };

  setToken(
    res: Response,
    token: string,
    type: keyof typeof CookieService.tokenKeys,
  ) {
    const timeCookie: Record<keyof typeof CookieService.tokenKeys, number> = {
      refresh: 3 * 24 * 60 * 60 * 1000,
      access: 15 * 60 * 1000,
      auth: 2 * 60 * 1000,
    };

    res.cookie(CookieService.tokenKeys[type], token, {
      maxAge: timeCookie[type],
      sameSite: 'none',
      httpOnly: true,
      secure: true,
    });
  }

  removeToken(res: Response, type: keyof typeof CookieService.tokenKeys) {
    res.clearCookie(CookieService.tokenKeys[type]);
  }
}
