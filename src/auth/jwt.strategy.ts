import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      // Nome de exibição de quem está logado — usado para registrar quem
      // realizou cada movimentação. Tokens antigos podem não tê-lo.
      name: typeof payload.name === 'string' && payload.name ? payload.name : undefined,
      role: payload.role || 'admin',
      employeeId: payload.employeeId,
    };
  }
}
